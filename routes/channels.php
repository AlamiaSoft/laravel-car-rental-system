<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('tenant.{tenantId}.orders', function ($user, $tenantId) {
    // Basic check: Ensure user belongs to the tenant
    return $user->tenant_id === $tenantId;
});
