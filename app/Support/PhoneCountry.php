<?php

namespace App\Support;

use InvalidArgumentException;

class PhoneCountry
{
    private const DATA_PATH = 'resources/js/data/phone-countries.json';

    /** @var list<array{name: string, iso2: string, dialCode: string}>|null */
    private static ?array $cached = null;

    /**
     * @return list<array{name: string, iso2: string, dialCode: string}>
     */
    public static function all(): array
    {
        if (self::$cached !== null) {
            return self::$cached;
        }

        $path = base_path(self::DATA_PATH);
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new InvalidArgumentException('Phone countries data file is missing.');
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            throw new InvalidArgumentException('Phone countries data file is invalid.');
        }

        /** @var list<array{name: string, iso2: string, dialCode: string}> $decoded */
        self::$cached = $decoded;

        return self::$cached;
    }

    /**
     * @return list<string>
     */
    public static function allowedNames(): array
    {
        return array_map(fn (array $row): string => $row['name'], self::all());
    }

    /**
     * @return array{name: string, iso2: string, dialCode: string}|null
     */
    public static function findByName(?string $name): ?array
    {
        if ($name === null || $name === '') {
            return null;
        }

        foreach (self::all() as $row) {
            if ($row['name'] === $name) {
                return $row;
            }
        }

        return null;
    }

    public static function defaultName(): string
    {
        return 'Canada';
    }

    /**
     * Canonical catalog name when the CSV value matches a row; otherwise {@see defaultName()}.
     *
     * @param  mixed  $raw  Typically string|null from CSV cells
     */
    public static function resolveNameForImport(mixed $raw): string
    {
        $trimmed = is_string($raw) ? trim($raw) : '';

        if ($trimmed === '') {
            return self::defaultName();
        }

        if (self::findByName($trimmed) !== null) {
            return $trimmed;
        }

        return self::defaultName();
    }

    public static function usesNanpMask(?string $countryName): bool
    {
        $row = self::findByName($countryName);

        return $row !== null && $row['dialCode'] === '+1';
    }

    public static function dialDigits(?string $countryName): string
    {
        $row = self::findByName($countryName);
        if ($row === null) {
            return '';
        }

        return preg_replace('/\D+/', '', $row['dialCode']) ?? '';
    }

    /**
     * Validation rules for a free-form phone label (any text the user or import provides).
     *
     * @param  string|null  $countryName  Retained for callers; not used in rules.
     * @return list<string>
     */
    public static function rulesForPhoneNumber(?string $countryName): array
    {
        return ['required', 'string', 'max:255'];
    }
}
