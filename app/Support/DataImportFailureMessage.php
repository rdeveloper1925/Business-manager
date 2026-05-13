<?php

namespace App\Support;

final class DataImportFailureMessage
{
    public static function fromThrowable(\Throwable $e): string
    {
        report($e);
        $message = trim($e->getMessage());

        return $message !== '' ? $message : $e::class;
    }
}
