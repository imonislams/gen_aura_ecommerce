# GEN AURA store - Laravel 12 + Inertia.js + React + Tailwind + MySQL

Frontend = `resources/js` (React + Inertia.js); the only Blade views are the Inertia root and PDF templates in `resources/views/exports`.
Backend = `app/Http/Controllers`, `app/Models`, `routes/web.php`.
Database = `database/migrations` + `database/seeders` (or import `database/genaura.sql` in phpMyAdmin).

## Run (Windows: install Laragon first, start Apache + MySQL, open Laragon Terminal)
```
cd path\to\gen-aura
php setup.php
```
It creates the database, installs packages (composer install), writes .env, creates all tables,
adds admin/admin (forced change on first login) + 4 sample products, links storage and starts the server.

Shop : http://localhost:8000
Admin: http://localhost:8000/admin   (admin / admin - you will be forced to change it on first login)

Next time: `php artisan serve`.

## Manual way
```
composer install
copy .env.example .env      (cp on Mac/Linux)
php artisan key:generate
(create empty MySQL database "gen_aura", set DB_* in .env)
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

## Go live
Upload the project, point the domain to the `public` folder, `composer install --no-dev`,
set APP_ENV=production, APP_DEBUG=false and real DB/MAIL values in `.env`,
`php artisan migrate --seed --force`, `php artisan storage:link`. The default admin login is forced to change on first sign-in.
