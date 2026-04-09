<?php

namespace Tests\Unit;

use Tests\TestCase;

class DatabaseConfigTest extends TestCase
{
    public function test_mysql_and_sqlite_database_connections_are_configured(): void
    {
        $connections = config('database.connections');

        $this->assertIsArray($connections);
        $this->assertArrayHasKey('mysql', $connections);
        $this->assertArrayHasKey('sqlite', $connections);
    }

    public function test_default_database_connection_follows_db_connection_environment_variable(): void
    {
        $this->assertSame(
            env('DB_CONNECTION', 'mysql'),
            config('database.default')
        );
    }
}
