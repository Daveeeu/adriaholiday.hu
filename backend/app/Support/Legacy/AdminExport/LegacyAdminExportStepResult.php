<?php

namespace App\Support\Legacy\AdminExport;

/**
 * What one step of the legacy admin export import did with its records.
 */
final class LegacyAdminExportStepResult
{
    public const CREATED = 'created';

    public const UPDATED = 'updated';

    public const UNCHANGED = 'unchanged';

    public const SKIPPED = 'skipped';

    public const FAILED = 'failed';

    /**
     * @var array<string, int>
     */
    private array $counts = [self::CREATED => 0, self::UPDATED => 0, self::UNCHANGED => 0, self::SKIPPED => 0, self::FAILED => 0];

    /**
     * @var array<int, string>
     */
    private array $messages = [];

    public function __construct(public readonly string $step) {}

    public function count(string $outcome, int $by = 1): void
    {
        $this->counts[$outcome] = ($this->counts[$outcome] ?? 0) + $by;
    }

    public function note(string $message): void
    {
        $this->messages[] = $message;
    }

    public function failed(?int $legacyId, string $message): void
    {
        $this->count(self::FAILED);
        $this->note(($legacyId !== null ? "#{$legacyId}: " : '').$message);
    }

    /**
     * @return array<string, int>
     */
    public function counts(): array
    {
        return $this->counts;
    }

    /**
     * @return array<int, string>
     */
    public function messages(): array
    {
        return $this->messages;
    }

    public function hasFailures(): bool
    {
        return $this->counts[self::FAILED] > 0;
    }

    /**
     * @return array{step: string, counts: array<string, int>, messages: array<int, string>}
     */
    public function toArray(): array
    {
        return ['step' => $this->step, 'counts' => $this->counts, 'messages' => $this->messages];
    }
}
