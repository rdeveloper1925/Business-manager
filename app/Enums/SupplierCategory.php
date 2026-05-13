<?php

namespace App\Enums;

enum SupplierCategory: string
{
    case Oem = 'OEM';
    case Aftermarket = 'Aftermarket';
    case Other = 'Other';
}
