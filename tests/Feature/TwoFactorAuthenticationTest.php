<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::create([
        'id' => 'test-restaurant',
        'name' => 'Test Restaurant',
        'is_active' => true,
    ]);

    $this->user = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'password' => bcrypt('password123'),
    ]);
});

test('user can enable two-factor authentication', function () {
    $response = $this->actingAs($this->user)
        ->post(route('two-factor.enable'));

    $response->assertRedirect();
    $this->user->refresh();

    expect($this->user->two_factor_secret)->not->toBeNull();
    expect($this->user->two_factor_recovery_codes)->not->toBeNull();
    expect($this->user->two_factor_confirmed_at)->toBeNull();
});

test('user can confirm two-factor authentication with valid code', function () {
    // First enable it
    $this->actingAs($this->user)->post(route('two-factor.enable'));
    $this->user->refresh();

    $google2fa = new Google2FA;
    $secret = decrypt($this->user->two_factor_secret);
    $validCode = $google2fa->getCurrentOtp($secret);

    $response = $this->actingAs($this->user)
        ->post(route('two-factor.confirm'), [
            'code' => $validCode,
        ]);

    $response->assertRedirect();
    $this->user->refresh();

    expect($this->user->two_factor_confirmed_at)->not->toBeNull();
});

test('user cannot confirm two-factor authentication with invalid code', function () {
    $this->actingAs($this->user)->post(route('two-factor.enable'));

    $response = $this->actingAs($this->user)
        ->post(route('two-factor.confirm'), [
            'code' => '123456', // Invalid code
        ]);

    $response->assertSessionHasErrors('code');
    $this->user->refresh();

    expect($this->user->two_factor_confirmed_at)->toBeNull();
});

test('user is redirected to two-factor challenge during login when enabled', function () {
    // Enable and confirm 2FA
    $provider = app(TwoFactorAuthenticationProvider::class);
    $secret = $provider->generateSecretKey();
    $this->user->forceFill([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode(['abcde-12345'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Attempt login
    $response = $this->post(route('login'), [
        'email' => $this->user->email,
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    expect(auth()->check())->toBeFalse();
    expect(session()->get('login.id'))->toBe($this->user->id);
});

test('user can authenticate via two-factor challenge using valid code', function () {
    $provider = app(TwoFactorAuthenticationProvider::class);
    $secret = $provider->generateSecretKey();
    $this->user->forceFill([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode(['abcde-12345'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Mock pending login session
    session(['login.id' => $this->user->id]);

    $google2fa = new Google2FA;
    $validCode = $google2fa->getCurrentOtp($secret);

    $response = $this->post('/two-factor-challenge', [
        'code' => $validCode,
    ]);

    $response->assertRedirect(route('dashboard'));
    expect(auth()->check())->toBeTrue();
    expect(auth()->id())->toBe($this->user->id);
});

test('user can authenticate via two-factor challenge using recovery code', function () {
    $this->user->forceFill([
        'two_factor_secret' => encrypt('secretKey123'),
        'two_factor_recovery_codes' => encrypt(json_encode(['abcde-12345'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Mock pending login session
    session(['login.id' => $this->user->id]);

    $response = $this->post('/two-factor-challenge', [
        'recovery_code' => 'abcde-12345',
    ]);

    $response->assertRedirect(route('dashboard'));
    expect(auth()->check())->toBeTrue();

    $this->user->refresh();
    // Verify recovery code was deleted/used
    expect($this->user->recoveryCodes())->toBeEmpty();
});
