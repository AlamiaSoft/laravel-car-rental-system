<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/profile');
});

test('oauth user without password can set password without providing current_password', function () {
    $user = User::factory()->create([
        'provider_name' => 'google',
        'provider_id' => 'google-test-123',
        'password' => null,
    ]);

    expect($user->hasPassword())->toBeFalse();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'password' => 'new-secret-password-123',
            'password_confirmation' => 'new-secret-password-123',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertTrue(Hash::check('new-secret-password-123', $user->refresh()->password));
    expect($user->hasPassword())->toBeTrue();
});
