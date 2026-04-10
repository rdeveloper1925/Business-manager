<?php

namespace App\Interfaces;

use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Contract for CSV-backed data loaders. Template generation is synchronous;
 * {@see startImport()} validates headers and dispatches async import work.
 */
interface IDataLoaderService
{
    public function loaderKey(): string;

    public function generateDataStructureTemplate(): StreamedResponse;

    /**
     * Validates the stored CSV header row, then dispatches the import job.
     *
     * @param  string  $absolutePath  Full path to the uploaded CSV on disk.
     * @param  string  $importId  Client-facing id for progress polling (UUID).
     */
    public function startImport(string $absolutePath, string $importId, int $userId): void;
}
