<?php

namespace App\Exceptions\Inventory;

use Exception;

class InvalidTransactionException extends Exception
{
    public function __construct(string $message)
    {
        parent::__construct($message);
    }
}
