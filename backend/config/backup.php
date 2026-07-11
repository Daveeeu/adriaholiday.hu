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
    | Retention
    |--------------------------------------------------------------------------
    |
    | Number of days a given backup type is kept before the daily backup run
    | prunes it. Database dumps are cheap and taken daily, so a shorter
    | retention is sufficient; storage/media archives are kept a bit longer.
    |
    */
    'database_retention_days' => (int) env('BACKUP_DATABASE_RETENTION_DAYS', 14),
    'storage_retention_days' => (int) env('BACKUP_STORAGE_RETENTION_DAYS', 30),

];
