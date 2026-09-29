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

function nc_normalize_code(string $code): string
{
    $normalized = preg_replace('/[^A-Z0-9]/', '', strtoupper(trim($code)));
    return is_string($normalized) ? $normalized : '';
}

function nc_passes(array $config): array
{
    if (!isset($config['passes']) || !is_array($config['passes'])) {
        return [];
    }

    return $config['passes'];
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
        $expiry = new DateTimeImmutable($expiresAt);
        return new DateTimeImmutable('now') <= $expiry;
    } catch (Throwable $error) {
        return false;
    }
}

function nc_redirect_to_access(string $status = 'invalid'): void
{
    header('Location: ./zugang/?status=' . rawurlencode($status), true, 303);
    exit;
}

function nc_wants_json_response(): bool
{
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? strtolower((string) $_SERVER['HTTP_ACCEPT']) : '';
    return strpos($accept, 'application/json') !== false;
}

function nc_reject_access(string $status, int $httpStatus, bool $wantsJson): void
{
    if (!$wantsJson) {
        nc_redirect_to_access($status);
    }

    session_write_close();
    http_response_code($httpStatus);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'status' => $status], JSON_UNESCAPED_SLASHES);
    exit;
}

nc_security_headers();
$config = nc_load_config();
nc_start_session($config);
nc_security_headers();
$wantsJson = nc_wants_json_response();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    nc_redirect_to_access('required');
}

$now = time();
$attempts = isset($_SESSION['nc_login_attempts']) && is_array($_SESSION['nc_login_attempts'])
    ? array_values(array_filter($_SESSION['nc_login_attempts'], static function ($timestamp) use ($now): bool {
        return is_int($timestamp) && $timestamp > ($now - 900);
    }))
    : [];

if (count($attempts) >= 8) {
    nc_reject_access('invalid', 429, $wantsJson);
}

$rawToken = isset($_POST['token']) && is_string($_POST['token']) ? trim($_POST['token']) : '';
$rawCode = isset($_POST['code']) && is_string($_POST['code']) ? nc_normalize_code($_POST['code']) : '';
$isTokenAttempt = $rawToken !== '';
$credential = $isTokenAttempt ? $rawToken : $rawCode;
$credentialIsPlausible = $isTokenAttempt
    ? (bool) preg_match('/^[A-Za-z0-9_-]{32,160}$/', $credential)
    : (bool) preg_match('/^[A-Z0-9]{8,32}$/', $credential);
$credentialHash = hash('sha256', $credential);
$hashField = $isTokenAttempt ? 'token_hash' : 'code_hash';
$matchedPass = null;
$matchedPassId = '';

foreach (nc_passes($config) as $configuredId => $candidate) {
    if (!is_array($candidate)) {
        continue;
    }

    $candidateId = is_string($configuredId) && trim($configuredId) !== ''
        ? trim($configuredId)
        : (isset($candidate['id']) ? trim((string) $candidate['id']) : '');
    $storedHash = isset($candidate[$hashField]) ? strtolower(trim((string) $candidate[$hashField])) : '';
    $validStoredHash = (bool) preg_match('/^[a-f0-9]{64}$/', $storedHash);
    $hashMatches = $validStoredHash && hash_equals($storedHash, $credentialHash);

    if ($candidateId !== '' && $credentialIsPlausible && $hashMatches && nc_pass_is_available($candidate)) {
        $matchedPass = $candidate;
        $matchedPassId = $candidateId;
    }
}

if (!is_array($matchedPass) || $matchedPassId === '') {
    $attempts[] = $now;
    $_SESSION['nc_login_attempts'] = $attempts;
    nc_reject_access('invalid', 401, $wantsJson);
}

session_regenerate_id(true);
$_SESSION = [];
$_SESSION['nc_pass_id'] = $matchedPassId;
$_SESSION['nc_issued_at'] = $now;
$_SESSION['nc_last_seen'] = $now;
$_SESSION['nc_csrf'] = bin2hex(random_bytes(24));

if ($wantsJson) {
    session_write_close();
    http_response_code(204);
    exit;
}

header('Location: ./', true, 303);
exit;
