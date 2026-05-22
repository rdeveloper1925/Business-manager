<?php

namespace App\Policies;

use App\Models\InventoryTransaction;
use App\Models\User;

/**
 * TODO: Replace allow-all with real rules (roles, tenants, verified email, etc.).
 */
class InventoryTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InventoryTransaction $inventoryTransaction): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, InventoryTransaction $inventoryTransaction): bool
    {
        return true;
    }
}
