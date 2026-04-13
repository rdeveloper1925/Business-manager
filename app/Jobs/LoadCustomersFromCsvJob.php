<?php

namespace App\Jobs;

use App\Broadcasting\DataImportProgressNotifier;
use App\Models\Customer;
use App\Services\DataLoad\CustomerLoadService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoadCustomersFromCsvJob implements ShouldQueue
{
    use Queueable;

    private const CHUNK_SIZE = 100;

    public int $timeout = 300;

    private ?string $lastBroadcastSignature = null;

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
            ], forceBroadcast: true);

            $total = $this->countDataRowsEligibleForImport();

            $this->updateState([
                'user_id' => $this->userId,
                'status' => 'processing',
                'progress' => $total === 0 ? 100 : 0,
                'processed' => 0,
                'total' => $total,
                'rows_loaded' => 0,
                'message' => null,
            ], forceBroadcast: true);

            if ($total === 0) {
                $this->updateState([
                    'user_id' => $this->userId,
                    'status' => 'success',
                    'progress' => 100,
                    'processed' => 0,
                    'total' => 0,
                    'rows_loaded' => 0,
                    'message' => null,
                ], forceBroadcast: true);

                return;
            }

            DB::transaction(function () use ($total): void {
                $this->streamInsertValidatedRows($total);
            });

            $this->updateState([
                'user_id' => $this->userId,
                'status' => 'success',
                'progress' => 100,
                'processed' => $total,
                'total' => $total,
                'rows_loaded' => $total,
                'message' => null,
            ], forceBroadcast: true);
        } catch (ValidationException $e) {
            $message = collect($e->errors())->flatten()->first() ?? __('Validation failed.');
            $this->markFailed($message);
        } catch (\Throwable $e) {
            $this->markFailed(__('Import failed. Please try again.'));
        } finally {
            if (is_file($this->absolutePath)) {
                @unlink($this->absolutePath);
            }
        }
    }

    /**
     * Count non-empty data rows with correct column count (no per-cell validation).
     */
    private function countDataRowsEligibleForImport(): int
    {
        $opened = $this->openCsvWithValidatedHeader();
        $handle = $opened['handle'];
        $expected = $opened['expected'];

        try {
            $count = 0;
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

                $count++;
            }

            return $count;
        } finally {
            fclose($handle);
        }
    }

    /**
     * Validate each row and insert in chunks; progress is written every chunk, broadcasts throttled.
     */
    private function streamInsertValidatedRows(int $total): void
    {
        $opened = $this->openCsvWithValidatedHeader();
        $handle = $opened['handle'];
        $expected = $opened['expected'];
        $now = now()->toDateTimeString();
        $buffer = [];
        $processed = 0;
        $lineNumber = 1;

        try {
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

                $buffer[] = [
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

                if (count($buffer) >= self::CHUNK_SIZE) {
                    $this->flushCustomerChunk($buffer, $now);
                    $processed += count($buffer);
                    $buffer = [];
                    $this->emitProgress($processed, $total);
                }
            }

            if ($buffer !== []) {
                $this->flushCustomerChunk($buffer, $now);
                $processed += count($buffer);
                $this->emitProgress($processed, $total);
            }
        } finally {
            fclose($handle);
        }
    }

    /**
     * @param  list<array<string, string|null>>  $rows
     */
    private function flushCustomerChunk(array $rows, string $now): void
    {
        $payload = [];
        foreach ($rows as $row) {
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
    }

    private function emitProgress(int $processed, int $total): void
    {
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

    /**
     * @return array{handle: resource, expected: list<string>}
     */
    private function openCsvWithValidatedHeader(): array
    {
        $handle = fopen($this->absolutePath, 'r');
        if ($handle === false) {
            throw ValidationException::withMessages([
                'csv' => [__('Could not read the uploaded CSV.')],
            ]);
        }

        $headerRow = fgetcsv($handle);
        if ($headerRow === false) {
            fclose($handle);

            throw ValidationException::withMessages([
                'csv' => [__('The CSV is empty.')],
            ]);
        }

        CustomerLoadService::stripUtf8BomFromFirstCell($headerRow);

        $expected = CustomerLoadService::expectedHeaders();
        if ($headerRow !== $expected) {
            fclose($handle);

            throw ValidationException::withMessages([
                'csv' => [__('The CSV headers are invalid.')],
            ]);
        }

        return ['handle' => $handle, 'expected' => $expected];
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
    private function updateState(array $state, bool $forceBroadcast = false): void
    {
        $signature = ($state['status'] ?? '').'|'.((int) ($state['progress'] ?? 0));
        $broadcast = $forceBroadcast || $signature !== $this->lastBroadcastSignature;

        DataImportProgressNotifier::notify($this->userId, $this->importId, $state, $broadcast);

        if ($broadcast) {
            $this->lastBroadcastSignature = $signature;
        }
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
        ], forceBroadcast: true);
    }
}
