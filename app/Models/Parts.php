<?php

namespace App\Models;

use App\Enums\PartDesignation;
use Database\Factories\PartsFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Parts extends Model
{
    /** @use HasFactory<PartsFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function casts(): array
    {
        return [
            'designation' => PartDesignation::class,
            'market_price' => 'decimal:2',
            'car_year' => 'integer',
        ];
    }

    protected $fillable = [
        'part_number',
        'part_name',
        'unit_of_measure',
        'description',
        'car_make',
        'car_model',
        'car_year',
        'designation',
        'supplier',
        'alternatives',
        'market_price',
        'created_by',
    ];
}
