<?php

namespace App\Jobs;

use App\Broadcasting\DataImportProgressNotifier;
use App\Models\Customer;
use App\Services\DataLoad\CustomerLoadService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoadCustomersFromCsvJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $importId,
        public string $absolutePath,
        public int $userId,
    ) {}

    public function handle(): void
    {
        try {
            $this->updateState([
                'user_id' => $this->userId,
                'status' => 'processing',
                'progress' => 0,
                'processed' => 0,
                'total' => 0,
                'rows_loaded' => 0,
                'message' => null,
            ]);

            $rowsToInsert = $this->collectValidatedRows();
            $total = count($rowsToInsert);

            $this->updateState([
                'user_id' => $this->userId,
                'status' => 'processing',
                'progress' => $total === 0 ? 100 : 0,
                'processed' => 0,
                'total' => $total,
                'rows_loaded' => 0,
                'message' => null,
            ]);

            if ($total === 0) {
                $this->updateState([
                    'user_id' => $this->userId,
                    'status' => 'success',
                    'progress' => 100,
                    'processed' => 0,
                    'total' => 0,
                    'rows_loaded' => 0,
                    'message' => null,
                ]);

                return;
            }

            DB::transaction(function () use ($rowsToInsert, $total): void {
                $now = now()->toDateTimeString();
                $processed = 0;

                foreach (array_chunk($rowsToInsert, 100) as $chunk) {
                    $payload = [];
                    foreach ($chunk as $row) {
                        $payload[] = [
                            'full_name' => $row['full_name'],
                            'organization_name' => $row['organization_name'],
                            'phone_country_name' => $row['phone_country_name'],
                            'phone_number' => $row['phone_number'],
                            'email' => $row['email'],
                            'address' => $row['address'],
                            'tax_id' => $row['tax_id'],
                            'created_at' => $now,
                            'updated_at' => $now,
                            'deleted_at' => null,
                        ];
                    }

                    Customer::insert($payload);
                    $processed += count($chunk);
                    $progress = (int) round(($processed / $total) * 100);

                    $this->updateState([
                        'user_id' => $this->userId,
                        'status' => 'processing',
                        'progress' => $progress,
                        'processed' => $processed,
                        'total' => $total,
                        'rows_loaded' => $processed,
                        'message' => null,
                    ]);
                }
            });

            $this->updateState([
                'user_id' => $this->userId,
                'status' => 'success',
                'progress' => 100,
                'processed' => $total,
                'total' => $total,
                'rows_loaded' => $total,
                'message' => null,
            ]);
        } catch (ValidationException $e) {
            $message = collect($e->errors())->flatten()->first() ?? __('Validation failed.');
            $this->markFailed($message);
        } catch (\Throwable $e) {
            Log::error('LoadCustomersFromCsvJob failed', [
                'import_id' => $this->importId,
                'exception' => $e,
            ]);
            $this->markFailed(__('Import failed. Please try again.'));
        } finally {
            if (is_file($this->absolutePath)) {
                @unlink($this->absolutePath);
            }
        }
    }

    /**
     * @return list<array<string, string|null>>
     */
    private function collectValidatedRows(): array
    {
        $handle = fopen($this->absolutePath, 'r');
        if ($handle === false) {
            throw ValidationException::withMessages([
                'csv' => [__('Could not read the uploaded CSV.')],
            ]);
        }

        try {
            $headerRow = fgetcsv($handle);
            if ($headerRow === false) {
                throw ValidationException::withMessages([
                    'csv' => [__('The CSV is empty.')],
                ]);
            }

            CustomerLoadService::stripUtf8BomFromFirstCell($headerRow);

            $expected = CustomerLoadService::expectedHeaders();
            if ($headerRow !== $expected) {
                throw ValidationException::withMessages([
                    'csv' => [__('The CSV headers are invalid.')],
                ]);
            }

            $rows = [];
            $lineNumber = 1;

            while (($row = fgetcsv($handle)) !== false) {
                $lineNumber++;

                if ($this->isCsvRowEmpty($row)) {
                    continue;
                }

                if (count($row) !== count($expected)) {
                    throw ValidationException::withMessages([
                        'csv' => [__('Row :line has the wrong number of columns.', ['line' => $lineNumber])],
                    ]);
                }

                /** @var array<string, string|null> $assoc */
                $assoc = CustomerLoadService::rowAssociative($row);

                foreach (['organization_name', 'tax_id'] as $nullableKey) {
                    if (($assoc[$nullableKey] ?? '') === '') {
                        $assoc[$nullableKey] = null;
                    }
                }

                CustomerLoadService::validateRowData($assoc, $lineNumber);

                $rows[] = [
                    'full_name' => (string) $assoc['full_name'],
                    'organization_name' => $assoc['organization_name'] !== null && $assoc['organization_name'] !== ''
                        ? (string) $assoc['organization_name']
                        : null,
                    'phone_country_name' => (string) $assoc['phone_country_name'],
                    'phone_number' => (string) $assoc['phone_number'],
                    'email' => strtolower((string) $assoc['email']),
                    'address' => (string) $assoc['address'],
                    'tax_id' => $assoc['tax_id'] !== null && $assoc['tax_id'] !== ''
                        ? (string) $assoc['tax_id']
                        : null,
                ];
            }

            return $rows;
        } finally {
            fclose($handle);
        }
    }

    /**
     * @param  array<int, string|null>|false  $row
     */
    private function isCsvRowEmpty(array|false $row): bool
    {
        if ($row === false) {
            return true;
        }

        $nonEmpty = array_filter($row, fn (?string $v): bool => $v !== null && trim((string) $v) !== '');

        return $nonEmpty === [];
    }

    /**
     * @param  array<string, mixed>  $state
     */
    private function updateState(array $state): void
    {
        DataImportProgressNotifier::notify($this->userId, $this->importId, $state);
    }

    private function markFailed(string $message): void
    {
        $this->updateState([
            'user_id' => $this->userId,
            'status' => 'failed',
            'progress' => 0,
            'processed' => 0,
            'total' => 0,
            'rows_loaded' => 0,
            'message' => $message,
        ]);
    }
}
