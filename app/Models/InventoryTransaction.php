<?php

namespace App\Models;

use App\Enums\ConditionType;
use App\Enums\TransactionType;
use Database\Factories\InventoryTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $transaction_id
 * @property int $part_id
 * @property int|null $supplier_id
 * @property int $performed_by
 * @property int|null $reference_id
 * @property string|null $reference_type
 * @property TransactionType $transaction_type
 * @property int $qty_delta
 * @property int $qty_after
 * @property string|null $unit_cost
 * @property ConditionType $condition
 * @property string|null $notes
 * @property Carbon $transacted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Part $part
 * @property-read Supplier|null $supplier
 * @property-read User $performer
 * @property-read Model|null $reference
 */
class InventoryTransaction extends Model
{
    /** @use HasFactory<InventoryTransactionFactory> */
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'transaction_id';

    public function getRouteKeyName(): string
    {
        return 'transaction_id';
    }

    /**
     * @var list<string>
     */
    protected $fillable = [
        'part_id',
        'supplier_id',
        'performed_by',
        'reference_id',
        'reference_type',
        'transaction_type',
        'qty_delta',
        'qty_after',
        'unit_cost',
        'condition',
        'notes',
        'transacted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'transacted_at' => 'datetime',
            'transaction_type' => TransactionType::class,
            'condition' => ConditionType::class,
        ];
    }

    /**
     * @return BelongsTo<Part, $this>
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class, 'part_id', 'part_id');
    }

    /**
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
