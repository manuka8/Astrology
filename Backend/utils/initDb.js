const db = require('../database');
const bcrypt = require('bcryptjs');

const initDb = async () => {
    console.log('--- Initializing Database ---');

    const schema = [
        `CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            is_system INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )`,

        `CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            module TEXT NOT NULL,
            action TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )`,

        `CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            mobile TEXT,
            country TEXT,
            profile_photo TEXT,
            role TEXT DEFAULT 'user',
            custom_role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
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

    // Add custom_role_id column to users if it doesn't exist (migration for existing DBs)
    try {
        await db.runAsync('ALTER TABLE users ADD COLUMN custom_role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL');
        console.log('✅ Added custom_role_id column to users table');
    } catch (e) { /* column already exists */ }

    // Seed permissions
    const permissionsExist = await db.getAsync('SELECT id FROM permissions LIMIT 1');
    if (!permissionsExist) {
        const perms = [
            { name: 'dashboard.view', module: 'dashboard', action: 'view', description: 'View admin dashboard' },
            { name: 'users.read', module: 'users', action: 'read', description: 'View users list' },
            { name: 'users.create', module: 'users', action: 'create', description: 'Create new users' },
            { name: 'users.edit', module: 'users', action: 'edit', description: 'Edit user details' },
            { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
            { name: 'plans.read', module: 'plans', action: 'read', description: 'View membership plans' },
            { name: 'plans.create', module: 'plans', action: 'create', description: 'Create membership plans' },
            { name: 'plans.edit', module: 'plans', action: 'edit', description: 'Edit membership plans' },
            { name: 'plans.delete', module: 'plans', action: 'delete', description: 'Delete membership plans' },
            { name: 'horoscopes.read', module: 'horoscopes', action: 'read', description: 'View horoscopes' },
            { name: 'horoscopes.create', module: 'horoscopes', action: 'create', description: 'Create horoscopes' },
            { name: 'horoscopes.edit', module: 'horoscopes', action: 'edit', description: 'Edit horoscopes' },
            { name: 'horoscopes.delete', module: 'horoscopes', action: 'delete', description: 'Delete horoscopes' },
            { name: 'notifications.read', module: 'notifications', action: 'read', description: 'View notifications' },
            { name: 'notifications.send', module: 'notifications', action: 'send', description: 'Send broadcast notifications' },
            { name: 'articles.read', module: 'articles', action: 'read', description: 'View articles' },
            { name: 'articles.create', module: 'articles', action: 'create', description: 'Create articles' },
            { name: 'articles.edit', module: 'articles', action: 'edit', description: 'Edit articles' },
            { name: 'articles.delete', module: 'articles', action: 'delete', description: 'Delete articles' },
            { name: 'contacts.read', module: 'contacts', action: 'read', description: 'View contact submissions' },
            { name: 'roles.manage', module: 'roles', action: 'manage', description: 'Manage roles and assign them to users' },
        ];
        for (const p of perms) {
            await db.runAsync(
                'INSERT INTO permissions (name, module, action, description) VALUES (?,?,?,?)',
                [p.name, p.module, p.action, p.description]
            );
        }
        console.log('✅ Permissions seeded.');

        // Seed default roles
        const defaultRoles = [
            { name: 'admin', display_name: 'Administrator', description: 'Full admin access except role management', is_system: 1 },
            { name: 'content_manager', display_name: 'Content Manager', description: 'Manage articles, horoscopes, and notifications', is_system: 1 },
            { name: 'support_staff', display_name: 'Support Staff', description: 'View users and handle contact inquiries', is_system: 1 },
            { name: 'moderator', display_name: 'Moderator', description: 'Manage articles and contacts', is_system: 1 },
        ];
        for (const r of defaultRoles) {
            await db.runAsync(
                'INSERT INTO roles (name, display_name, description, is_system) VALUES (?,?,?,?)',
                [r.name, r.display_name, r.description, r.is_system]
            );
        }
        console.log('✅ Default roles seeded.');

        // Assign permissions to default roles
        const allPerms = await db.allAsync('SELECT id, name FROM permissions');
        const permMap = {};
        for (const p of allPerms) permMap[p.name] = p.id;

        const adminRole = await db.getAsync("SELECT id FROM roles WHERE name='admin'");
        const contentRole = await db.getAsync("SELECT id FROM roles WHERE name='content_manager'");
        const supportRole = await db.getAsync("SELECT id FROM roles WHERE name='support_staff'");
        const modRole = await db.getAsync("SELECT id FROM roles WHERE name='moderator'");

        const adminPerms = Object.keys(permMap).filter(p => p !== 'roles.manage');
        const contentPerms = ['dashboard.view','horoscopes.read','horoscopes.create','horoscopes.edit','horoscopes.delete','notifications.read','notifications.send','articles.read','articles.create','articles.edit','articles.delete'];
        const supportPerms = ['dashboard.view','users.read','contacts.read','notifications.read'];
        const modPerms = ['dashboard.view','articles.read','articles.create','articles.edit','articles.delete','contacts.read'];

        for (const p of adminPerms) {
            await db.runAsync('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)', [adminRole.id, permMap[p]]);
        }
        for (const p of contentPerms) {
            await db.runAsync('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)', [contentRole.id, permMap[p]]);
        }
        for (const p of supportPerms) {
            await db.runAsync('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)', [supportRole.id, permMap[p]]);
        }
        for (const p of modPerms) {
            await db.runAsync('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)', [modRole.id, permMap[p]]);
        }
        console.log('✅ Role permissions assigned.');
    }

    // Seed admin
    const adminExists = await db.getAsync("SELECT id FROM users WHERE role IN ('admin','super_admin') LIMIT 1");
    if (!adminExists) {
        const hash = await bcrypt.hash('admin123', 10);
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 10);
        await db.runAsync(
            `INSERT INTO users (name,email,password,role,membership_plan,membership_expiry,email_verified,is_active)
             VALUES (?,?,?,?,?,?,?,?)`,
            ['Super Admin', 'admin@astro.lk', hash, 'super_admin', 'platinum', expiry.toISOString(), 1, 1]
        );
        console.log('✅ Super Admin created: admin@astro.lk / admin123');
    } else {
        // Upgrade existing 'admin' to 'super_admin' if no super_admin exists yet
        const superAdminExists = await db.getAsync("SELECT id FROM users WHERE role='super_admin' LIMIT 1");
        if (!superAdminExists) {
            await db.runAsync("UPDATE users SET role='super_admin' WHERE role='admin' ORDER BY id LIMIT 1");
            console.log('✅ Upgraded first admin to super_admin.');
        }
    }

    console.log('--- Database Ready ---');
};

module.exports = initDb;
