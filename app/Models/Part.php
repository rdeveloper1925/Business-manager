<?php

namespace App\Models;

use Database\Factories\PartFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $part_id
 * @property string $part_name
 * @property string $part_number
 * @property string|null $description
 * @property string $unit_of_measure
 * @property string $cost_price
 * @property string $sell_price
 * @property int|null $supplier_id
 * @property int $reorder_point
 * @property int $min_stock_level
 * @property int $max_stock_level
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Supplier|null $supplier
 * @property-read Inventory|null $inventory
 * @property-read Collection<int, InventoryTransaction> $inventoryTransactions
 */
class Part extends Model
{
    /** @use HasFactory<PartFactory> */
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'part_id';

    public function getRouteKeyName(): string
    {
        return 'part_id';
    }

    /**
     * @var list<string>
     */
    protected $fillable = [
        'part_name',
        'part_number',
        'description',
        'unit_of_measure',
        'cost_price',
        'sell_price',
        'supplier_id',
        'reorder_point',
        'min_stock_level',
        'max_stock_level',
    ];

    /**
     * @param  Builder<Part>  $query
     * @return Builder<Part>
     */
    public function scopeLowStock(Builder $query): Builder
    {
        $inventoryTable = (new Inventory)->getTable();

        return $query
            ->join($inventoryTable, (new Part)->qualifyColumn('part_id'), '=', "{$inventoryTable}.part_id")
            ->where((new Part)->qualifyColumn('reorder_point'), '>', 0)
            ->whereColumn("{$inventoryTable}.quantity_on_hand", '<=', (new Part)->qualifyColumn('reorder_point'))
            ->select((new Part)->qualifyColumn('*'));
    }

    /**
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');
    }

    /**
     * @return HasOne<Inventory, $this>
     */
    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'part_id', 'part_id');
    }

    /**
     * @return HasMany<InventoryTransaction, $this>
     */
    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'part_id', 'part_id');
    }
}
