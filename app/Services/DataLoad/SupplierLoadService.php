<?php

namespace App\Services\DataLoad;

use App\Enums\SupplierCategory;
use App\Jobs\LoadSuppliersFromCsvJob;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SupplierLoadService
{
    /**
     * @return list<string>
     */
    public static function expectedHeaders(): array
    {
        return ['contact_person_name', 'company_name', 'phone', 'email', 'address', 'category'];
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
            'Content-Disposition' => 'attachment; filename="supplier_import_template.csv"',
        ]);
    }

    public function startImport(string $absolutePath, string $importId, int|string $userId): void
    {
        $this->assertHeaderRowMatches($absolutePath);

        LoadSuppliersFromCsvJob::dispatch($importId, $absolutePath, $userId);
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
        $combined = array_combine($expected, $row);
        if ($combined === false) {
            throw ValidationException::withMessages([
                'csv' => [__('Invalid row shape.')],
            ]);
        }

        return $combined;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function validateRowData(array &$data, int $lineNumber): void
    {
        foreach (['contact_person_name', 'company_name', 'phone', 'email', 'address', 'category'] as $key) {
            if (isset($data[$key]) && is_string($data[$key])) {
                $data[$key] = trim($data[$key]);
            }
        }

        $validator = Validator::make($data, [
            'contact_person_name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'address' => ['required', 'string'],
            'category' => ['required', Rule::enum(SupplierCategory::class)],
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
