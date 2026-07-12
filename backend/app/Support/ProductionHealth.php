<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class ProductionHealth
{
    /**
     * @return array{
     *   status: string,
     *   app: array{name: string, env: string, debug: bool, url: string},
     *   checks: array<string, array{status: string, message: string, meta?: array<string, mixed>}>,
     *   timestamp: string
     * }
     */
    public function snapshot(): array
    {
        $checks = [
            'database' => $this->databaseCheck(),
            'redis' => $this->redisCheck(),
            'storage' => $this->storageCheck(),
            'public_storage_link' => $this->storageLinkCheck(),
            'queue' => $this->queueCheck(),
        ];

        $status = collect($checks)->every(
            fn (array $check): bool => $check['status'] === 'ok'
        ) ? 'ok' : 'degraded';

        return [
            'status' => $status,
            'app' => [
                'name' => (string) config('app.name'),
                'env' => (string) config('app.env'),
                'debug' => (bool) config('app.debug'),
                'url' => (string) config('app.url'),
            ],
            'checks' => $checks,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function isHealthy(): bool
    {
        return $this->snapshot()['status'] === 'ok';
    }

    /**
     * @return array{status: string, message: string, meta?: array<string, mixed>}
     */
    private function databaseCheck(): array
    {
        try {
            DB::select('select 1');

            return [
                'status' => 'ok',
                'message' => 'Database connection established.',
                'meta' => [
                    'connection' => DB::getDefaultConnection(),
                ],
            ];
        } catch (Throwable $exception) {
            return [
                'status' => 'failed',
                'message' => $exception->getMessage(),
            ];
        }
    }

    /**
     * @return array{status: string, message: string, meta?: array<string, mixed>}
     */
    private function redisCheck(): array
    {
        try {
            $connection = (string) config('database.redis.default.database', '0');
            $response = Redis::connection()->ping();

            // The phpredis client returns a bool true on a successful PING
            // (not the string "PONG" that predis returns), so also accept
            // that instead of only matching the string response.
            $isHealthy = $response === true || str_contains(strtolower((string) $response), 'pong');

            return [
                'status' => $isHealthy ? 'ok' : 'failed',
                'message' => 'Redis connection reachable.',
                'meta' => [
                    'database' => $connection,
                    'response' => is_bool($response) ? var_export($response, true) : (string) $response,
                ],
            ];
        } catch (Throwable $exception) {
            return [
                'status' => 'failed',
                'message' => $exception->getMessage(),
            ];
        }
    }

    /**
     * @return array{status: string, message: string, meta?: array<string, mixed>}
     */
    private function storageCheck(): array
    {
        $paths = [
            'app' => storage_path('app'),
            'logs' => storage_path('logs'),
        ];

        $unwritable = collect($paths)
            ->reject(fn (string $path): bool => is_dir($path) && is_writable($path))
            ->keys()
            ->values()
            ->all();

        if ($unwritable !== []) {
            return [
                'status' => 'failed',
                'message' => 'One or more storage directories are not writable.',
                'meta' => [
                    'unwritable' => $unwritable,
                ],
            ];
        }

        return [
            'status' => 'ok',
            'message' => 'Storage directories are writable.',
            'meta' => $paths,
        ];
    }

    /**
     * @return array{status: string, message: string, meta?: array<string, mixed>}
     */
    private function storageLinkCheck(): array
    {
        $publicStorage = public_path('storage');
        $target = storage_path('app/public');

        if (is_link($publicStorage) && realpath($publicStorage) === realpath($target)) {
            return [
                'status' => 'ok',
                'message' => 'Public storage symlink is valid.',
                'meta' => [
                    'path' => $publicStorage,
                    'target' => $target,
                ],
            ];
        }

        return [
            'status' => 'failed',
            'message' => 'Public storage symlink is missing or points to the wrong target.',
            'meta' => [
                'path' => $publicStorage,
                'expectedTarget' => $target,
            ],
        ];
    }

    /**
     * @return array{status: string, message: string, meta?: array<string, mixed>}
     */
    private function queueCheck(): array
    {
        try {
            $failed = DB::table(config('queue.failed.table', 'failed_jobs'))->count();

            return [
                'status' => 'ok',
                'message' => 'Queue backend reachable.',
                'meta' => [
                    'connection' => (string) config('queue.default'),
                    'queue' => (string) config('queue.connections.redis.queue', 'default'),
                    'failedJobs' => $failed,
                ],
            ];
        } catch (Throwable $exception) {
            return [
                'status' => 'failed',
                'message' => $exception->getMessage(),
            ];
        }
    }
}
