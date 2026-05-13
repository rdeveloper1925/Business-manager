<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;

/**
 * TODO: Replace allow-all with real rules (roles, tenants, verified email, etc.).
 *
 * Note: `User` does not implement {@see MustVerifyEmail}, so the
 * `verified` route middleware does not block unverified users. Requiring
 * {@see User::hasVerifiedEmail()} here caused 403 on customers/data-load for normal logins.
 */
class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Customer $customer): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Customer $customer): bool
    {
        return true;
    }

    public function delete(User $user, Customer $customer): bool
    {
        return true;
    }

    public function restore(User $user, Customer $customer): bool
    {
        return true;
    }

    public function forceDelete(User $user, Customer $customer): bool
    {
        return true;
    }
}
