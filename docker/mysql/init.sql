-- Initialize database for Ticket Place
-- This script runs when the MySQL container starts for the first time

USE ticket_place_db;

-- Set character set
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database if not exists (handled by environment variable)
-- Create users and tables will be handled by Spring Boot JPA

-- Create additional indexes for performance
-- These will be created after JPA creates the tables

-- Example optimization queries (optional)
-- ALTER TABLE events ADD INDEX idx_event_dates (start_date, end_date);
-- ALTER TABLE tickets ADD INDEX idx_ticket_status (status, created_at);
-- ALTER TABLE reservations ADD INDEX idx_reservation_user (user_id, created_at);

SET FOREIGN_KEY_CHECKS = 1;
