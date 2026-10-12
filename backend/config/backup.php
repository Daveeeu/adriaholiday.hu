<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Backup switch
    |--------------------------------------------------------------------------
    |
    | Lets an operator disable the scheduled backup run (e.g. in a staging
    | environment sharing the production scheduler image) without removing
    | the schedule entry itself.
    |
    */
    'disabled' => env('BACKUP_DISABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Backup storage path
    |--------------------------------------------------------------------------
    |
    | Where database dumps and storage/media archives are written. This must
    | live on a volume that survives container recreation (see the
    | `laravel-backups` named volume in docker-compose.prod.yml) — writing
    | backups to the same ephemeral filesystem as the container itself would
    | defeat the point of having them.
    |
    */
    'path' => env('BACKUP_PATH', storage_path('app/backups')),

    /*
    |--------------------------------------------------------------------------
    | Media Source
    |--------------------------------------------------------------------------
    |
    | The uploaded media directory archived by backup:run (the public disk
    | the media library writes to).
    |
    */
    'media_path' => storage_path('app/public'),

    /*
    |--------------------------------------------------------------------------
    | Retention
    |--------------------------------------------------------------------------
    |
    | Number of days a given backup type is kept before the daily backup run
    | prunes it. Every media archive holds the whole media library (over a
    | gigabyte since the legacy import), so a longer window fills the disk.
    |
    */
    'database_retention_days' => (int) env('BACKUP_DATABASE_RETENTION_DAYS', 3),
    'storage_retention_days' => (int) env('BACKUP_STORAGE_RETENTION_DAYS', 3),

];
