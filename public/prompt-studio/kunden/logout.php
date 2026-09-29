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

nc_security_headers();
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_samesite', 'Lax');
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
nc_security_headers();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Location: ./', true, 303);
    exit;
}

$providedCsrf = isset($_POST['csrf']) && is_string($_POST['csrf']) ? $_POST['csrf'] : '';
$sessionCsrf = isset($_SESSION['nc_csrf']) && is_string($_SESSION['nc_csrf']) ? $_SESSION['nc_csrf'] : '';

if ($providedCsrf === '' || $sessionCsrf === '' || !hash_equals($sessionCsrf, $providedCsrf)) {
    header('Location: ./', true, 303);
    exit;
}

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

header('Location: ./zugang/?status=signedout', true, 303);
exit;
