-- TimeTrack Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS timetrack_db;
USE timetrack_db;

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  device_id VARCHAR(36) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  url TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_seconds INT DEFAULT 0,
  category ENUM('productive', 'unproductive', 'neutral') DEFAULT 'neutral',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  
  INDEX idx_device (device_id),
  INDEX idx_domain (domain),
  INDEX idx_start_time (start_time),
  INDEX idx_category (category)
);

-- Optional: Sample categories table for future use
CREATE TABLE IF NOT EXISTS domain_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  category ENUM('productive', 'unproductive', 'neutral') DEFAULT 'neutral',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for domain categorization
INSERT INTO domain_categories (domain, category) VALUES
  ('github.com', 'productive'),
  ('stackoverflow.com', 'productive'),
  ('youtube.com', 'unproductive'),
  ('facebook.com', 'unproductive'),
  ('twitter.com', 'unproductive'),
  ('linkedin.com', 'productive'),
  ('docs.google.com', 'productive')
ON DUPLICATE KEY UPDATE category=VALUES(category);

SELECT * FROM devices;
SELECT * FROM sessions;
SELECT * FROM domain_categories;

