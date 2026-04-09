<?php

namespace Tests\Unit;

use Tests\TestCase;

class DatabaseConfigTest extends TestCase
{
    public function test_only_mysql_database_connection_is_configured(): void
    {
        $connections = config('database.connections');

        $this->assertIsArray($connections);
        $this->assertSame(['mysql'], array_keys($connections));
    }

    public function test_default_database_connection_is_mysql(): void
    {
        $this->assertSame('mysql', config('database.default'));
    }
}
