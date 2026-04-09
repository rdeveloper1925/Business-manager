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
        $this->restrictDatabaseToMysql();
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
     * Laravel merges framework database connections; keep only MySQL.
     */
    protected function restrictDatabaseToMysql(): void
    {
        $mysql = config('database.connections.mysql');

        if (! is_array($mysql)) {
            throw new RuntimeException('The mysql database connection must be configured.');
        }

        config([
            'database.connections' => ['mysql' => $mysql],
            'database.default' => 'mysql',
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
