const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const addAdmin = async () => {
    const name = 'Admin User';
    const email = 'admin@astro.lk';
    const password = 'adminpassword123';
    const role = 'admin';

    try {
        // Check if user exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            console.log(`User with email ${email} already exists.`);
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert admin
        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin user:', error.message);
        process.exit(1);
    }
};

addAdmin();
