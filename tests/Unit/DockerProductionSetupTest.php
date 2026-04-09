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
        $this->assertFileExists($root.'/docker/Dockerfile');
        $this->assertFileExists($root.'/docker/entrypoint.sh');
        $this->assertFileExists($root.'/docker/000-default.conf');
    }
}
