const db = require('../database');
const bcrypt = require('bcryptjs');

const initDb = async () => {
    console.log('--- Initializing Database ---');

    const schema = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            mobile TEXT,
            country TEXT,
            profile_photo TEXT,
            role TEXT DEFAULT 'user',
            membership_plan TEXT DEFAULT 'free',
            membership_expiry TEXT,
            is_active INTEGER DEFAULT 1,
            email_verified INTEGER DEFAULT 1,
            reset_token TEXT,
            reset_token_expiry TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )`,

        `CREATE TABLE IF NOT EXISTS membership_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            duration_months INTEGER NOT NULL,
            max_members INTEGER DEFAULT 3,
            max_matching INTEGER DEFAULT 1,
            max_predictions INTEGER DEFAULT 3,
            features TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        )`,

        `CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            gender TEXT,
            date_of_birth TEXT,
            time_of_birth TEXT,
            birth_place TEXT,
            relationship TEXT,
            profile_photo TEXT,
            horoscope_pdf TEXT,
            zodiac_sign TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS horoscopes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            name TEXT,
            gender TEXT,
            birth_date TEXT,
            birth_time TEXT,
            birth_place TEXT,
            zodiac_sign TEXT,
            horoscope_pdf TEXT,
            generated_data TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (member_id) REFERENCES family_members(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS horoscope_matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            member1_id INTEGER NOT NULL,
            member2_id INTEGER NOT NULL,
            match_type TEXT DEFAULT 'marriage',
            compatibility_score REAL,
            strengths TEXT,
            weaknesses TEXT,
            recommended_actions TEXT,
            detailed_report TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (member1_id) REFERENCES family_members(id),
            FOREIGN KEY (member2_id) REFERENCES family_members(id)
        )`,

        `CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            member_id INTEGER,
            prediction_type TEXT NOT NULL,
            period TEXT NOT NULL,
            period_date TEXT,
            love TEXT,
            career TEXT,
            finance TEXT,
            health TEXT,
            education TEXT,
            overview TEXT,
            opportunities TEXT,
            challenges TEXT,
            lucky_dates TEXT,
            important_events TEXT,
            year_summary TEXT,
            ai_summary TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'LKR',
            payment_method TEXT,
            transaction_id TEXT,
            status TEXT DEFAULT 'pending',
            starts_at TEXT,
            expires_at TEXT,
            invoice_number TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES membership_plans(id)
        )`,

        `CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        `CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'unread',
            created_at TEXT DEFAULT (datetime('now'))
        )`,

        `CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            category TEXT,
            author_id INTEGER,
            cover_image TEXT,
            is_published INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (author_id) REFERENCES users(id)
        )`,

        `CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            entity TEXT,
            entity_id INTEGER,
            details TEXT,
            ip TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )`,

        `CREATE TABLE IF NOT EXISTS prediction_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            month TEXT NOT NULL,
            daily_count INTEGER DEFAULT 0,
            monthly_count INTEGER DEFAULT 0,
            yearly_count INTEGER DEFAULT 0,
            matching_count INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
    ];

    for (const sql of schema) {
        await db.runAsync(sql);
    }

    // Seed membership plans
    const plansExist = await db.getAsync('SELECT id FROM membership_plans LIMIT 1');
    if (!plansExist) {
        const plans = [
            { name: 'Free', price: 0, duration_months: 3, max_members: 3, max_matching: 1, max_predictions: 3, features: JSON.stringify(['Daily predictions', '3 family members', '1 horoscope match/month', '3 predictions/month']) },
            { name: 'Premium', price: 1999, duration_months: 12, max_members: 10, max_matching: -1, max_predictions: -1, features: JSON.stringify(['Unlimited predictions', '10 family members', 'Unlimited horoscope matching', 'Monthly & yearly predictions', 'Priority support']) },
            { name: 'Platinum', price: 4999, duration_months: 12, max_members: -1, max_matching: -1, max_predictions: -1, features: JSON.stringify(['Unlimited everything', 'Advanced AI analysis', 'Personalized reports', 'Priority support', 'Early access to new features']) },
        ];
        for (const p of plans) {
            await db.runAsync(
                'INSERT INTO membership_plans (name,price,duration_months,max_members,max_matching,max_predictions,features) VALUES (?,?,?,?,?,?,?)',
                [p.name, p.price, p.duration_months, p.max_members, p.max_matching, p.max_predictions, p.features]
            );
        }
        console.log('✅ Membership plans seeded.');
    }

    // Seed admin
    const adminExists = await db.getAsync("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (!adminExists) {
        const hash = await bcrypt.hash('admin123', 10);
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 10);
        await db.runAsync(
            `INSERT INTO users (name,email,password,role,membership_plan,membership_expiry,email_verified,is_active)
             VALUES (?,?,?,?,?,?,?,?)`,
            ['Super Admin', 'admin@astro.lk', hash, 'admin', 'platinum', expiry.toISOString(), 1, 1]
        );
        console.log('✅ Admin created: admin@astro.lk / admin123');
    }

    console.log('--- Database Ready ---');
};

module.exports = initDb;
