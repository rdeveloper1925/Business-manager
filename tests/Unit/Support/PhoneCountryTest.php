<?php

namespace Tests\Unit\Support;

use App\Support\PhoneCountry;
use Tests\TestCase;

class PhoneCountryTest extends TestCase
{
    public function test_resolve_name_for_import_returns_canada_when_blank(): void
    {
        $this->assertSame('Canada', PhoneCountry::resolveNameForImport(''));
        $this->assertSame('Canada', PhoneCountry::resolveNameForImport('   '));
        $this->assertSame('Canada', PhoneCountry::resolveNameForImport(null));
    }

    public function test_resolve_name_for_import_returns_canada_when_unknown(): void
    {
        $this->assertSame('Canada', PhoneCountry::resolveNameForImport('Atlantis'));
    }

    public function test_resolve_name_for_import_returns_canonical_name_when_known(): void
    {
        $this->assertSame('United States', PhoneCountry::resolveNameForImport('United States'));
        $this->assertSame('Tonga', PhoneCountry::resolveNameForImport('Tonga'));
    }
}
