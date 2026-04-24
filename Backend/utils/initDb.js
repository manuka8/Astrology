const db = require('../config/db');

const initDb = async () => {
    console.log('--- Database Initialization ---');
    try {
        // Users Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                dob DATE,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table is ready.');

        // Horoscopes Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS horoscopes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sign VARCHAR(50) NOT NULL,
                prediction TEXT NOT NULL,
                date DATE NOT NULL,
                type ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Horoscopes table is ready.');

        console.log('--- Database Initialization Complete ---');
    } catch (error) {
        console.error('❌ Database Initialization Failed:', error.message);
    }
};

module.exports = initDb;
