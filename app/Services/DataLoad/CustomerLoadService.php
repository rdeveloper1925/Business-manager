<?php

namespace App\Services\DataLoad;

use App\Jobs\LoadCustomersFromCsvJob;
use App\Support\PhoneCountry;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerLoadService
{
    /**
     * @return list<string>
     */
    public static function expectedHeaders(): array
    {
        return ['full_name', 'organization_name', 'phone_country_name', 'phone_number', 'email', 'address', 'tax_id'];
    }

    public function loaderKey(): string
    {
        return 'customers';
    }

    public function generateDataStructureTemplate(): StreamedResponse
    {
        $headers = self::expectedHeaders();

        return new StreamedResponse(function () use ($headers): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            fputcsv($out, $headers);
            fclose($out);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="customer_import_template.csv"',
        ]);
    }

    public function startImport(string $absolutePath, string $importId, int $userId): void
    {
        $this->assertHeaderRowMatches($absolutePath);

        LoadCustomersFromCsvJob::dispatch($importId, $absolutePath, $userId);
    }

    /**
     * @throws ValidationException
     */
    public function assertHeaderRowMatches(string $absolutePath): void
    {
        $handle = fopen($absolutePath, 'r');
        if ($handle === false) {
            throw ValidationException::withMessages([
                'file' => [__('Could not read the uploaded CSV.')],
            ]);
        }

        try {
            $headerRow = fgetcsv($handle);
            if ($headerRow === false) {
                throw ValidationException::withMessages([
                    'file' => [__('The CSV is empty.')],
                ]);
            }

            self::stripUtf8BomFromFirstCell($headerRow);

            $expected = self::expectedHeaders();
            if ($headerRow !== $expected) {
                throw ValidationException::withMessages([
                    'file' => [__('The first row must exactly match the template column headers and order.')],
                ]);
            }
        } finally {
            fclose($handle);
        }
    }

    /**
     * @param  array<int, string|null>  $row
     * @return array<string, string|null>
     */
    public static function rowAssociative(array $row): array
    {
        $expected = self::expectedHeaders();

        return array_combine($expected, $row);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function validateRowData(array $data, int $lineNumber): void
    {
        $countryName = isset($data['phone_country_name']) && is_string($data['phone_country_name'])
            ? $data['phone_country_name']
            : null;

        $validator = Validator::make($data, [
            'full_name' => ['required', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'phone_country_name' => ['required', 'string', 'max:255', Rule::in(PhoneCountry::allowedNames())],
            'phone_number' => PhoneCountry::rulesForPhoneNumber($countryName),
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'address' => ['required', 'string'],
            'tax_id' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            $message = $validator->errors()->first();

            throw ValidationException::withMessages([
                'csv' => [__('Row :line: :message', ['line' => $lineNumber, 'message' => $message])],
            ]);
        }
    }

    /**
     * @param  array<int, string|null>  $row
     */
    public static function stripUtf8BomFromFirstCell(array &$row): void
    {
        if ($row === [] || ! isset($row[0]) || ! is_string($row[0])) {
            return;
        }

        $row[0] = preg_replace('/^\xEF\xBB\xBF/', '', $row[0]) ?? $row[0];
    }
}
