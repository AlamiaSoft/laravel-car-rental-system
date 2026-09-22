<?php

namespace App\Capability;

use Illuminate\Contracts\Support\Arrayable;

readonly class CapabilityFrontendDto implements Arrayable
{
    public function __construct(
        public string $key,
        public string $name,
        public string $description,
        public string $icon,
        public ?string $navLabel,
        public ?string $navRoute,
        public bool $hasPwaExperience,
        /** @var string[] */
        public array $dependencies,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'nav_label' => $this->navLabel,
            'nav_route' => $this->navRoute,
            'has_pwa_experience' => $this->hasPwaExperience,
            'dependencies' => $this->dependencies,
        ];
    }
}
