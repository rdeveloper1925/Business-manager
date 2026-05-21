<?php

namespace App\Policies;

use App\Models\Part;
use App\Models\User;

/**
 * TODO: Replace allow-all with real rules (roles, tenants, verified email, etc.).
 */
class PartPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Part $part): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Part $part): bool
    {
        return true;
    }

    public function delete(User $user, Part $part): bool
    {
        return true;
    }

    public function restore(User $user, Part $part): bool
    {
        return true;
    }

    public function forceDelete(User $user, Part $part): bool
    {
        return true;
    }
}
