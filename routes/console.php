<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('billing:generate-invoices')->dailyAt('00:00');
Schedule::command('app:backup-database')->dailyAt('02:00');
