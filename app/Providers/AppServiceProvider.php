<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->restrictDatabaseConnections();
        $this->configureUrlScheme();
        $this->configureDefaults();
    }

    /**
     * Generate https:// URLs when APP_URL uses HTTPS (avoids mixed content if the request looks like HTTP behind a proxy).
     */
    protected function configureUrlScheme(): void
    {
        if (parse_url((string) config('app.url'), PHP_URL_SCHEME) === 'https') {
            URL::forceScheme('https');
        }
    }

    /**
     * Laravel merges framework database connections; keep only Postgres outside automated tests.
     *
     * PHPUnit uses an in-memory SQLite database; testing must retain the sqlite connection
     * and honor the DB_CONNECTION environment variable instead of forcing a single default.
     */
    protected function restrictDatabaseConnections(): void
    {
        $pgsql = config('database.connections.pgsql');

        if (! is_array($pgsql)) {
            throw new RuntimeException('The pgsql database connection must be configured.');
        }

        if ($this->app->environment('testing')) {
            $sqlite = config('database.connections.sqlite');

            if (! is_array($sqlite)) {
                throw new RuntimeException('The sqlite database connection must be configured for testing.');
            }

            config([
                'database.connections' => [
                    'sqlite' => $sqlite,
                    'pgsql' => $pgsql,
                ],
                'database.default' => env('DB_CONNECTION', 'pgsql'),
            ]);

            return;
        }

        config([
            'database.connections' => ['pgsql' => $pgsql],
            // Only `pgsql` exists here; align default (avoids local boot before tests when .env still says mysql).
            'database.default' => 'pgsql',
        ]);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
