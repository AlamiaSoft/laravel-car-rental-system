<?php

try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=postgres', 'postgres', 'postgres');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Check if db exists
    $stmt = $pdo->query("SELECT 1 FROM pg_database WHERE datname = 'alamia_os'");
    if (! $stmt->fetch()) {
        $pdo->exec('CREATE DATABASE alamia_os');
        echo "Database alamia_os created successfully.\n";
    } else {
        echo "Database alamia_os already exists.\n";
    }
} catch (PDOException $e) {
    echo 'Connection failed: '.$e->getMessage()."\n";
}
