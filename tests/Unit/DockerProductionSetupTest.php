<?php

namespace Tests\Unit;

use Tests\TestCase;

class DockerProductionSetupTest extends TestCase
{
    public function test_docker_production_files_exist(): void
    {
        $root = dirname(__DIR__, 2);
        $this->assertFileExists($root.'/docker-compose.yml');
        $this->assertFileExists($root.'/.dockerignore');
        $this->assertFileExists($root.'/docker/common/php-fpm/Dockerfile');
        $this->assertFileExists($root.'/docker/production/php-fpm/entrypoint.sh');
        $this->assertFileExists($root.'/docker/production/apache/000-default.conf');
    }
}
