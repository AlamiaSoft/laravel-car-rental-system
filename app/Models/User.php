<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'password_set_at', 'tenant_id', 'phone', 'provider_name', 'provider_id', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_set_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Determine if the user belongs to the central platform (no tenant context).
     */
    public function isPlatformUser(): bool
    {
        return $this->tenant_id === null;
    }

    /**
     * Determine if the user has a local password set.
     */
    public function hasPassword(): bool
    {
        if (! empty($this->provider_name) && is_null($this->password_set_at)) {
            return false;
        }

        return ! empty($this->password);
    }

    /**
     * Determine if the user is a platform administrator.
     */
    public function isPlatformAdmin(): bool
    {
        return $this->hasRole(UserRole::SuperAdmin->value) && $this->isPlatformUser();
    }
}
