<?php
// One-command setup (run inside this folder):  php setup.php
if (PHP_SAPI !== 'cli') exit("Run this in a terminal: php setup.php\n");
function ask($q, $d = '') { echo $q . ($d !== '' ? " [$d]" : '') . ': '; $v = trim((string) fgets(STDIN)); return $v === '' ? $d : $v; }
function run($c, $must = true) { echo "\n> $c\n"; passthru($c, $code); if ($code && $must) { echo "\nFAILED: $c\n"; exit(1); } return $code === 0; }
function envset(&$txt, $k, $v) {
    $line = $k . '=' . (preg_match('/[\s#"\']/', $v) || $v === '' ? '"' . addcslashes($v, '"\\') . '"' : $v);
    $n = 0;
    $txt = preg_replace_callback('/^#?\s*' . preg_quote($k, '/') . '=.*$/m', function () use ($line, &$n) { $n++; return $n === 1 ? $line : ''; }, $txt);
    if ($n === 0) $txt .= "\n" . $line;
}
echo "=== GEN AURA setup ===\n";
if (!extension_loaded('pdo_mysql')) exit("PHP extension pdo_mysql is missing. In Laragon/XAMPP enable it in php.ini.\n");
chdir(__DIR__);
$host = ask('MySQL host', '127.0.0.1'); $port = ask('MySQL port', '3306'); $user = ask('MySQL username', 'root'); $pass = ask('MySQL password (empty if none)');
$db = ask('Database name', 'gen_aura');
$email = ask('Your email for order alerts (empty to skip)'); $mpass = $email ? ask('Gmail app password (16 digits, empty to skip)') : '';
try {
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "\nDatabase '$db' is ready.\n";
} catch (Throwable $e) { exit("\nCould not connect to MySQL: " . $e->getMessage() . "\nStart MySQL (Laragon/XAMPP), check username/password, then run again.\n"); }
if (!is_dir('vendor')) run('composer install --no-interaction');
if (!file_exists('.env')) copy('.env.example', '.env');
$t = file_get_contents('.env');
foreach (['DB_CONNECTION' => 'mysql', 'DB_HOST' => $host, 'DB_PORT' => $port, 'DB_DATABASE' => $db, 'DB_USERNAME' => $user, 'DB_PASSWORD' => $pass] as $k => $v) envset($t, $k, $v);
if ($email) foreach (['ORDER_EMAIL_TO' => $email, 'MAIL_MAILER' => $mpass ? 'smtp' : 'log', 'MAIL_HOST' => 'smtp.gmail.com', 'MAIL_PORT' => '587', 'MAIL_USERNAME' => $email, 'MAIL_PASSWORD' => $mpass, 'MAIL_ENCRYPTION' => 'tls', 'MAIL_FROM_ADDRESS' => $email] as $k => $v) envset($t, $k, $v);
file_put_contents('.env', $t);
run('php artisan key:generate --force');
run('php artisan config:clear', false);
run('php artisan migrate --seed --force');
if (!run('php artisan storage:link', false)) echo "\n(storage:link failed. On Windows run the terminal as Administrator once and run: php artisan storage:link)\n";
echo "\n=== DONE ===\nShop : http://localhost:8000\nAdmin: http://localhost:8000/admin  (admin / admin - you will be forced to change it on first login)\n";
if (strtolower(ask('Start the server now? (y/n)', 'y')) === 'y') run('php artisan serve', false);
