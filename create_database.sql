-- Create database for ticket-place application
CREATE DATABASE IF NOT EXISTS ticketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user for the application (optional, recommended for production)
-- CREATE USER IF NOT EXISTS 'ticketplace_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON ticketplace_db.* TO 'ticketplace_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE ticketplace_db;

-- Show database creation confirmation
SELECT 'Database ticketplace_db created successfully!' as message;
