<?php

namespace Tests\Feature;

use Tests\TestCase;

class LandingPagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_landing_home_page_is_available()
    {
        $this->get(route('home'))->assertOk();
    }

    public function test_landing_overview_page_is_available()
    {
        $this->get(route('landing.overview'))->assertOk();
    }

    public function test_landing_contact_page_is_available()
    {
        $this->get(route('landing.contact'))->assertOk();
    }

    public function test_landing_demo_page_is_available()
    {
        $this->get(route('landing.demo'))->assertOk();
    }
}
