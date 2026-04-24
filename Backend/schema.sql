-- Create Database
CREATE DATABASE IF NOT EXISTS astrology_db;
USE astrology_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dob DATE,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Horoscopes Table (Mental model for future features)
CREATE TABLE IF NOT EXISTS horoscopes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sign VARCHAR(50) NOT NULL,
    prediction TEXT NOT NULL,
    date DATE NOT NULL,
    type ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin (password will be hashed via script/controller later, but for reference)
-- Password: password123 (hashed)
-- INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@astro.lk', '$2a$10$YourHashedPasswordHere', 'admin');
