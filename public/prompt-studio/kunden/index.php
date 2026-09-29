<?php
declare(strict_types=1);

const NC_SESSION_NAME = '__Secure-nc_customer';
const NC_COOKIE_PATH = '/prompt-studio/kunden/';

function nc_security_headers(): void
{
    header('Cache-Control: private, no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header('X-Frame-Options: DENY');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    header("Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'");
}

function nc_load_config(): array
{
    $configuredPath = getenv('NC_PRAXIS_CONFIG');
    $configPath = is_string($configuredPath) && trim($configuredPath) !== ''
        ? trim($configuredPath)
        : dirname(__DIR__, 4) . DIRECTORY_SEPARATOR . '.nextcourse-private' . DIRECTORY_SEPARATOR . 'praxis-passes.php';

    if (!is_file($configPath) || !is_readable($configPath)) {
        return [];
    }

    try {
        $config = require $configPath;
    } catch (Throwable $error) {
        return [];
    }

    return is_array($config) ? $config : [];
}

function nc_session_settings(array $config): array
{
    $settings = isset($config['session']) && is_array($config['session']) ? $config['session'] : [];
    $idle = isset($settings['idle_seconds']) ? (int) $settings['idle_seconds'] : 3600;
    $absolute = isset($settings['absolute_seconds']) ? (int) $settings['absolute_seconds'] : 43200;

    return [
        'idle_seconds' => max(300, min($idle, 86400)),
        'absolute_seconds' => max(900, min($absolute, 604800)),
    ];
}

function nc_start_session(array $config): void
{
    $settings = nc_session_settings($config);
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.gc_maxlifetime', (string) $settings['absolute_seconds']);
    session_name(NC_SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => NC_COOKIE_PATH,
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_cache_limiter('nocache');
    session_start();
}

function nc_pass_is_available(array $pass): bool
{
    if (!isset($pass['active']) || $pass['active'] !== true) {
        return false;
    }

    $expiresAt = isset($pass['expires_at']) ? trim((string) $pass['expires_at']) : '';
    if ($expiresAt === '') {
        return true;
    }

    try {
        return new DateTimeImmutable('now') <= new DateTimeImmutable($expiresAt);
    } catch (Throwable $error) {
        return false;
    }
}

function nc_destroy_session(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => NC_COOKIE_PATH,
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    session_destroy();
}

function nc_redirect_to_access(): void
{
    header('Location: ./zugang/?status=required', true, 302);
    exit;
}

function nc_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

nc_security_headers();
$config = nc_load_config();
nc_start_session($config);
nc_security_headers();

$passId = isset($_SESSION['nc_pass_id']) ? trim((string) $_SESSION['nc_pass_id']) : '';
$currentPass = null;
$passes = isset($config['passes']) && is_array($config['passes']) ? $config['passes'] : [];

foreach ($passes as $configuredId => $candidate) {
    if (!is_array($candidate)) {
        continue;
    }
    $candidateId = is_string($configuredId) && trim($configuredId) !== ''
        ? trim($configuredId)
        : (isset($candidate['id']) ? trim((string) $candidate['id']) : '');
    if ($candidateId !== '' && hash_equals($candidateId, $passId) && nc_pass_is_available($candidate)) {
        $currentPass = $candidate;
    }
}

$settings = nc_session_settings($config);
$now = time();
$issuedAt = isset($_SESSION['nc_issued_at']) ? (int) $_SESSION['nc_issued_at'] : 0;
$lastSeen = isset($_SESSION['nc_last_seen']) ? (int) $_SESSION['nc_last_seen'] : 0;
$sessionExpired = $issuedAt <= 0
    || $lastSeen <= 0
    || ($now - $lastSeen) > $settings['idle_seconds']
    || ($now - $issuedAt) > $settings['absolute_seconds'];

if (!is_array($currentPass) || $passId === '' || $sessionExpired) {
    nc_destroy_session();
    nc_redirect_to_access();
}

$_SESSION['nc_last_seen'] = $now;
if (!isset($_SESSION['nc_csrf']) || !is_string($_SESSION['nc_csrf'])) {
    $_SESSION['nc_csrf'] = bin2hex(random_bytes(24));
}

$passLabel = isset($currentPass['label']) && trim((string) $currentPass['label']) !== ''
    ? trim((string) $currentPass['label'])
    : 'Praxis-Gast';
$allowedTopics = isset($currentPass['topics']) && is_array($currentPass['topics'])
    ? array_values(array_unique(array_map(static function ($topic): string {
        return strtolower(trim((string) $topic));
    }, $currentPass['topics'])))
    : [];
$allTopicsAllowed = in_array('*', $allowedTopics, true);

$goalLabels = [
    'zeit' => 'Zeit sparen',
    'energie' => 'Energie sparen',
    'prompts' => 'Bessere Prompts',
    'skills' => 'Skills & Abläufe',
];
$categoryLabels = [
    'sprechen' => ['label' => 'Sprechen statt tippen', 'icon' => '🎙️'],
    'ki-vorarbeit' => ['label' => 'KI übernimmt Vorarbeit', 'icon' => '🧠'],
    'einrichten' => ['label' => 'Einmal einrichten', 'icon' => '⚡'],
    'geraete' => ['label' => 'Geräte-Tricks', 'icon' => '📱'],
    'kopf' => ['label' => 'Kopf entlasten', 'icon' => '🧩'],
];
$formatLabels = [
    'tipp' => 'Abkürzung',
    'trick' => 'Geräte-Trick',
    'prompt-rezept' => 'Prompt',
    'skill-ablauf' => 'Mini-System',
];

$cards = require __DIR__ . DIRECTORY_SEPARATOR . 'tipps.php';
if (!is_array($cards)) {
    $cards = [];
}

$visibleCards = array_values(array_filter($cards, static function (array $card) use ($allowedTopics, $allTopicsAllowed): bool {
    return $allTopicsAllowed || count(array_intersect($card['goals'], $allowedTopics)) > 0;
}));
$visibleCategoryKeys = [];
foreach ($visibleCards as $visibleCard) {
    foreach ($visibleCard['categories'] as $categoryKey) {
        if (isset($categoryLabels[$categoryKey])) {
            $visibleCategoryKeys[$categoryKey] = true;
        }
    }
}
$starterCard = null;
foreach ($visibleCards as $visibleCard) {
    if (($visibleCard['featured'] ?? false) === true) {
        $starterCard = $visibleCard;
        break;
    }
}
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#122A2F">
  <meta name="description" content="Geschützte NextCourse Werkzeugkiste mit 15 sofort nutzbaren Alltags-Abkürzungen.">
  <title>Dein Praxis-Hub | NextCourse Prompt Studio</title>
  <link rel="icon" type="image/png" sizes="192x192" href="./zugang/entry-icon-20260908.png">
  <meta property="og:image" content="https://www.next-course.de/prompt-studio/kunden/zugang/entry-icon-20260908.png">
  <link rel="stylesheet" href="./praxis.css?v=20260907-2">
  <script src="./praxis.js?v=20260907-2" defer></script>
</head>
<body class="hub-page">
  <a class="skip-link" href="#praxis-inhalte">Direkt zu den Alltags-Abkürzungen</a>

  <header class="hub-topbar">
    <a class="hub-brand" href="../" aria-label="NextCourse Prompt Studio öffnen">
      <img src="../assets/nc-logo-96-84085c2b.webp" alt="" width="46" height="46">
      <span><strong>NextCourse</strong><small>Prompt Studio</small></span>
    </a>
    <nav class="hub-topnav" aria-label="Direkte Wege">
      <a class="topnav-link topnav-link--hub" href="../">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h14M7 16V8l5-4 5 4v8M10 19v-5h4v5"/></svg>
        <span>Prompt Studio</span>
      </a>
      <a class="topnav-link topnav-link--site" href="https://www.next-course.de/">
        <span>Zur Website</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>
      </a>
      <form action="./logout.php" method="post">
        <input type="hidden" name="csrf" value="<?= nc_h((string) $_SESSION['nc_csrf']) ?>">
        <button class="logout-button" type="submit" aria-label="Vom Praxis-Hub abmelden">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5m4-4 3-3-3-3m3 3H9"/></svg>
          <span>Abmelden</span>
        </button>
      </form>
    </nav>
  </header>

  <main>
    <section class="hub-hero" aria-labelledby="hub-title">
      <div class="hero-copy hero-copy--toolbox">
        <p class="eyebrow"><span></span> Deine Werkzeugkiste · Zugang <?= nc_h($passLabel) ?></p>
        <h1 id="hub-title">Kleine Abkürzungen für einen <em>leichteren Alltag.</em></h1>
        <p class="hero-promise">Weniger tippen. Weniger suchen. Weniger im Kopf behalten.</p>
        <p class="hero-intro">Praktische Funktionen, Prompts und Mini-Systeme, die Zeit sparen, Denkaufwand reduzieren und lästige Aufgaben vereinfachen.</p>
        <div class="hero-actions">
          <a class="button button--primary" href="#praxis-inhalte">Abkürzungen entdecken</a>
          <a class="button button--secondary" href="../">Prompt Studio kennenlernen</a>
        </div>
      </div>
      <div class="hero-path hero-path--toolbox" aria-label="Von der Abkürzung zum eigenen Werkzeug">
        <div class="path-line" aria-hidden="true"></div>
        <article class="path-step path-step--one">
          <span>01</span>
          <div><strong>Entdecken</strong><small>Was soll gerade leichter werden?</small></div>
        </article>
        <article class="path-step path-step--two">
          <span>02</span>
          <div><strong>Ausprobieren</strong><small>Funktion, Satz oder Prompt direkt nutzen.</small></div>
        </article>
        <article class="path-step path-step--three">
          <span>03</span>
          <div><strong>Wiederverwenden</strong><small>Gute Abläufe im Studio weiterbauen.</small></div>
        </article>
        <p class="path-note">Kein Technik-Wissen nötig. Beginne mit genau einem kleinen Helfer.</p>
      </div>
    </section>

    <section class="finder" id="praxis-inhalte" aria-labelledby="finder-title">
      <div class="finder-heading">
        <div>
          <p class="eyebrow"><span></span> Entdecken</p>
          <h2 id="finder-title">Was soll gerade leichter werden?</h2>
        </div>
        <p><strong><?= count($visibleCards) ?></strong> direkt nutzbare Abkürzungen</p>
      </div>

      <?php if (count($visibleCards) > 0): ?>
        <?php if (is_array($starterCard)): ?>
          <article class="starter-spotlight" aria-labelledby="starter-title">
            <div class="starter-copy">
              <span class="starter-label">Starte hier · keine Einrichtung</span>
              <h3 id="starter-title"><?= nc_h($starterCard['title']) ?></h3>
              <p><?= nc_h($starterCard['summary']) ?></p>
              <a class="starter-link" href="#tipp-<?= nc_h($starterCard['id']) ?>" data-open-tip>
                Jetzt ausprobieren
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>
              </a>
            </div>
            <div class="starter-flow" aria-label="Vorher-Nachher-Beispiel">
              <div class="flow-state">
                <small>Vorher</small>
                <strong><?= nc_h($starterCard['before']) ?></strong>
              </div>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>
              <div class="flow-state flow-state--after">
                <small>Nachher</small>
                <strong><?= nc_h($starterCard['after']) ?></strong>
              </div>
            </div>
          </article>
        <?php endif; ?>

        <div class="filter-panel filter-panel--toolbox" data-filter-panel>
          <label class="search-field">
            <span class="visually-hidden">Alltags-Abkürzungen durchsuchen</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="m16 16 4 4"></path></svg>
            <input type="search" placeholder="Zum Beispiel: Dokument, Windows, Nachricht …" autocomplete="off" data-filter-search>
          </label>

          <div class="filter-group category-filter" aria-labelledby="category-filter-label">
            <span class="filter-label" id="category-filter-label">Kategorie wählen</span>
            <div class="filter-buttons" role="group" aria-labelledby="category-filter-label">
              <button type="button" class="filter-button filter-button--category is-active" data-filter-category="all" aria-pressed="true">Alle</button>
              <?php foreach ($categoryLabels as $categoryKey => $category): ?>
                <?php if (isset($visibleCategoryKeys[$categoryKey])): ?>
                  <button type="button" class="filter-button filter-button--category" data-filter-category="<?= nc_h($categoryKey) ?>" aria-pressed="false">
                    <span class="filter-icon" aria-hidden="true"><?= nc_h($category['icon']) ?></span>
                    <?= nc_h($category['label']) ?>
                  </button>
                <?php endif; ?>
              <?php endforeach; ?>
            </div>
          </div>
        </div>

        <p class="result-status" aria-live="polite" data-result-status><?= count($visibleCards) ?> Abkürzungen angezeigt</p>
        <p class="toolbox-data-note">Bei externen KI-Diensten werden deine Eingaben dort verarbeitet. Nutze keine sensiblen Daten und prüfe Namen, Zahlen, Termine und wichtige Aussagen.</p>

        <div class="impulse-grid" data-card-grid>
          <?php foreach ($visibleCards as $card): ?>
            <?php
              $primaryCategoryKey = $card['categories'][0];
              $primaryCategory = $categoryLabels[$primaryCategoryKey];
              $searchable = implode(' ', [
                  $card['title'],
                  $card['summary'],
                  $card['problem'],
                  $card['before'],
                  $card['after'],
                  $card['device'],
                  $card['cost'],
                  $card['setup'],
                  $card['benefit'],
                  implode(' ', $card['steps']),
                  implode(' ', $card['tools']),
                  implode(' ', $card['tags']),
              ]);
            ?>
            <article
              class="impulse-card<?= ($card['featured'] ?? false) === true ? ' is-featured' : '' ?>"
              id="tipp-<?= nc_h($card['id']) ?>"
              data-card
              data-categories="<?= nc_h(implode(' ', $card['categories'])) ?>"
              data-search="<?= nc_h(strtolower($searchable)) ?>"
            >
              <header class="card-header">
                <div class="card-header-main">
                  <span class="card-number"><?= nc_h($card['number']) ?></span>
                  <span class="category-mark" aria-hidden="true"><?= nc_h($primaryCategory['icon']) ?></span>
                  <span class="category-name"><?= nc_h($primaryCategory['label']) ?></span>
                </div>
                <span class="format-badge"><?= nc_h($formatLabels[$card['format']] ?? 'Abkürzung') ?> · leicht</span>
              </header>
              <div class="card-copy card-copy--toolbox">
                <h3><?= nc_h($card['title']) ?></h3>
                <p><?= nc_h($card['summary']) ?></p>
                <span class="card-benefit"><?= nc_h($card['benefit']) ?></span>
              </div>

              <div class="card-transformation" aria-label="Vorher-Nachher">
                <div class="transform-side">
                  <small>Vorher</small>
                  <strong><?= nc_h($card['before']) ?></strong>
                </div>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>
                <div class="transform-side transform-side--after">
                  <small>Nachher</small>
                  <strong><?= nc_h($card['after']) ?></strong>
                </div>
              </div>

              <dl class="card-facts" aria-label="Aufwand und Voraussetzungen">
                <div><dt>Ausprobieren</dt><dd><?= nc_h($card['try_time']) ?></dd></div>
                <div><dt>Kosten</dt><dd><?= nc_h($card['cost']) ?></dd></div>
                <div><dt>Gerät</dt><dd><?= nc_h($card['device']) ?></dd></div>
                <div><dt>Einrichtung</dt><dd><?= nc_h($card['setup']) ?></dd></div>
              </dl>

              <details class="card-details" data-card-details>
                <summary>
                  <span data-details-label>Abkürzung öffnen</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"></path></svg>
                </summary>
                <div class="detail-content">
                  <section class="problem-panel">
                    <h4>Das Problem</h4>
                    <p><?= nc_h($card['problem']) ?></p>
                  </section>

                  <?php if (is_string($card['template']) && trim($card['template']) !== ''): ?>
                    <section class="template-section">
                      <div class="template-heading">
                        <h4>Direkt ausprobieren</h4>
                        <?php if (is_string($card['copy_label']) && trim($card['copy_label']) !== ''): ?>
                          <button type="button" class="copy-button" data-copy-target="template-<?= nc_h($card['id']) ?>">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="10" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1"></path></svg>
                            <span data-copy-label><?= nc_h($card['copy_label']) ?></span>
                          </button>
                        <?php endif; ?>
                      </div>
                      <pre id="template-<?= nc_h($card['id']) ?>"><?= nc_h($card['template']) ?></pre>
                    </section>
                  <?php endif; ?>

                  <section>
                    <h4>So geht's</h4>
                    <ol>
                      <?php foreach ($card['steps'] as $step): ?>
                        <li><?= nc_h($step) ?></li>
                      <?php endforeach; ?>
                    </ol>
                  </section>

                  <section>
                    <h4>Werkzeug</h4>
                    <ul class="tools-list">
                      <?php foreach ($card['tools'] as $tool): ?>
                        <li><?= nc_h($tool) ?></li>
                      <?php endforeach; ?>
                    </ul>
                  </section>

                  <div class="insight-grid">
                    <section>
                      <h4>Nutzen</h4>
                      <p><?= nc_h($card['why']) ?></p>
                      <?php if (is_string($card['saving']) && trim($card['saving']) !== ''): ?>
                        <p><strong>Zeitersparnis:</strong> <?= nc_h($card['saving']) ?></p>
                      <?php endif; ?>
                    </section>
                    <section>
                      <h4>Darauf achten</h4>
                      <p><?= nc_h($card['warning']) ?></p>
                    </section>
                  </div>

                  <div class="detail-actions">
                    <a class="studio-cta" href="../#/dashboard">
                      <span>
                        <small>Speichern oder anpassen</small>
                        Im Prompt Studio weiterbauen
                      </span>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>
                    </a>
                    <?php if (is_string($card['skill_name']) && trim($card['skill_name']) !== ''): ?>
                      <p class="skill-note">Daraus kann dein eigener Skill „<?= nc_h($card['skill_name']) ?>“ werden.</p>
                    <?php endif; ?>
                  </div>
                </div>
              </details>
            </article>
          <?php endforeach; ?>
        </div>
        <div class="empty-state" data-empty-state hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M7 12h10M10 19h4"></path></svg>
          <h3>Noch kein Treffer</h3>
          <p>Ändere den Suchbegriff oder setze einen Filter zurück.</p>
          <button type="button" class="button button--secondary" data-reset-filters>Alle Abkürzungen zeigen</button>
        </div>
      <?php else: ?>
        <div class="empty-state empty-state--static">
          <h3>Für diesen Zugang sind noch keine Abkürzungen freigeschaltet.</h3>
          <p>Bitte wende dich an deine NextCourse-Ansprechperson.</p>
          <a class="button button--primary" href="https://www.next-course.de/kontakt/">Kontakt öffnen</a>
        </div>
      <?php endif; ?>
    </section>

    <section class="concept-guide" aria-labelledby="concept-title">
      <div class="concept-guide__heading">
        <p class="eyebrow"><span></span> Drei einfache Bausteine</p>
        <h2 id="concept-title">Was ist eine Abkürzung, ein Prompt oder ein Skill?</h2>
        <p>Du musst die Begriffe nicht kennen, um loszulegen. Diese kurze Einordnung zeigt dir nur, wie aus einer kleinen Idee ein wiederverwendbarer Helfer werden kann.</p>
      </div>
      <div class="concept-grid">
        <article class="concept-card">
          <span aria-hidden="true">💡</span>
          <h3>Abkürzung</h3>
          <p>Eine kleine Funktion oder Idee, die sofort etwas leichter macht – etwa Text aus einem Screenshot zu kopieren.</p>
        </article>
        <article class="concept-card">
          <span aria-hidden="true">📋</span>
          <h3>Prompt</h3>
          <p>Eine fertige Anweisung für eine KI, die du kopierst, mit deinen Angaben ergänzt und direkt ausprobierst.</p>
        </article>
        <article class="concept-card">
          <span aria-hidden="true">⚙️</span>
          <h3>Skill</h3>
          <p>Ein wiederverwendbarer Arbeitsablauf mit festen Regeln – zum Beispiel dein persönlicher Dokumenten-Prüfer.</p>
        </article>
      </div>
    </section>

    <section class="studio-bridge" aria-labelledby="studio-bridge-title">
      <p class="bridge-kicker">Ausprobiert? Dann mach es zu deinem Werkzeug.</p>
      <h2 id="studio-bridge-title">Im Prompt Studio wird aus einer guten Abkürzung dein eigener Helfer.</h2>
      <p>Übernimm einen Prompt, passe ihn an deinen Alltag an und entwickle daraus bei Bedarf einen wiederverwendbaren Skill.</p>
      <div class="hero-actions">
        <a class="button button--primary" href="../">Prompt Studio öffnen</a>
        <a class="text-link" href="https://www.next-course.de/">
          NextCourse Website
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>
        </a>
      </div>
    </section>
  </main>

  <footer class="hub-footer">
    <p>NextCourse · KI, die im Arbeitsalltag ankommt.</p>
    <nav aria-label="Rechtliches">
      <a href="../../impressum/">Impressum</a>
      <a href="../../datenschutz/">Datenschutz</a>
    </nav>
  </footer>

  <div class="copy-toast" role="status" aria-live="polite" aria-atomic="true" data-copy-toast></div>
</body>
</html>
