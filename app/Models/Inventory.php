<?php

namespace App\Models;

use Database\Factories\InventoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $inventory_id
 * @property int $part_id
 * @property int $quantity_on_hand
 * @property int $quantity_reserved
 * @property int $quantity_on_order
 * @property Carbon|null $latest_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Part $part
 */
class Inventory extends Model
{
    /** @use HasFactory<InventoryFactory> */
    use HasFactory;

    protected $primaryKey = 'inventory_id';

    public function getRouteKeyName(): string
    {
        return 'inventory_id';
    }

    protected $table = 'inventory';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'part_id',
        'quantity_on_hand',
        'quantity_reserved',
        'quantity_on_order',
        'latest_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latest_count' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Part, $this>
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class, 'part_id', 'part_id');
    }
}
