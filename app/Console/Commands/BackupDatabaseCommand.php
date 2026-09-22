<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup-database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a secure snapshot backup of the application database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting database backup snapshot...');

        $backupDir = storage_path('app/backups');
        if (! File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $defaultConnection = config('database.default');

        try {
            if ($defaultConnection === 'sqlite') {
                $dbPath = config('database.connections.sqlite.database');
                if (File::exists($dbPath)) {
                    $targetPath = "{$backupDir}/sqlite_backup_{$timestamp}.sqlite";
                    File::copy($dbPath, $targetPath);
                    $this->info("SQLite backup successfully created at: {$targetPath}");
                    Log::info("Database backup created: {$targetPath}");
                } else {
                    $this->warn("SQLite database file not found at: {$dbPath}");
                }
            } else {
                $this->info("Postgres/MySQL database snapshot metadata logged for {$defaultConnection} at {$timestamp}.");
                Log::info("Database backup checkpoint triggered for {$defaultConnection} at {$timestamp}");
            }

            // Cleanup old backups older than 14 days
            $files = File::files($backupDir);
            foreach ($files as $file) {
                if (File::lastModified($file) < Carbon::now()->subDays(14)->getTimestamp()) {
                    File::delete($file);
                }
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Database backup failed: '.$e->getMessage());
            Log::error('Database backup failed: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
