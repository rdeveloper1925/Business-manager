<?php

namespace App\Enums;

enum ConditionType: string
{
    case Good = 'GOOD';
    case Damaged = 'DAMAGED';
    case Defective = 'DEFECTIVE';

    public function label(): string
    {
        return match ($this) {
            self::Good => 'Good',
            self::Damaged => 'Damaged',
            self::Defective => 'Defective',
        };
    }
}
