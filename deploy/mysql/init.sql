-- MySQL initialization script for Heimdallr development environment
-- This script creates the database and user if they don't exist

CREATE DATABASE IF NOT EXISTS heimdallr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the heimdallr user
GRANT ALL PRIVILEGES ON heimdallr.* TO 'heimdallr'@'%';
FLUSH PRIVILEGES;

-- The application will automatically create tables on startup