<?php

namespace Tests\Unit;

use App\Enums\TransactionType;
use App\Support\Inventory\TransactionQtyDelta;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TransactionQtyDeltaTest extends TestCase
{
    #[DataProvider('normalizeProvider')]
    public function test_normalize(TransactionType $type, int $input, int $expected): void
    {
        $this->assertSame(
            $expected,
            TransactionQtyDelta::normalize($type, $input),
        );
    }

    /**
     * @return array<string, array{TransactionType, int, int}>
     */
    public static function normalizeProvider(): array
    {
        return [
            'restock negative becomes positive' => [TransactionType::Restock, -5, 5],
            'return negative becomes positive' => [TransactionType::Return, -3, 3],
            'sale positive becomes negative' => [TransactionType::Sale, 5, -5],
            'damaged positive becomes negative' => [TransactionType::Damaged, 2, -2],
            'adjustment keeps sign' => [TransactionType::Adjustment, -3, -3],
            'transfer keeps sign' => [TransactionType::Transfer, 4, 4],
            'stocktake keeps sign' => [TransactionType::Stocktake, 0, 0],
        ];
    }
}
