const db = require('../database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

// ── Helpers ───────────────────────────────────────────────────────────────────

const getFilePath = (file) => {
    if (!file) return null;
    const p = file.path.replace(/\\/g, '/');
    const idx = p.indexOf('/uploads/');
    return idx >= 0 ? p.slice(idx) : `/${file.filename}`;
};

const getFilePaths = (files) => {
    if (!files || !files.length) return null;
    return JSON.stringify(files.map(getFilePath));
};

const cleanupExpiredAccounts = async () => {
    try {
        const expired = await db.allAsync(
            "SELECT ta.id, ta.application_id FROM expert_temp_accounts ta WHERE ta.account_expires_at IS NOT NULL AND ta.account_expires_at < datetime('now') AND ta.is_active=1"
        );
        for (const ta of expired) {
            await db.runAsync('DELETE FROM expert_applications WHERE id=?', [ta.application_id]);
        }
    } catch (e) { /* silent */ }
};

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/experts/browse
const browseExperts = async (req, res) => {
    try {
        const { search = '', specialization = '', language = '', consultation_type = '' } = req.query;
        let sql = `SELECT u.id, u.name, u.profile_photo as user_photo,
                   ep.bio, ep.specializations, ep.experience_years, ep.rating, ep.review_count, ep.is_available,
                   ep.headline, ep.consultation_types, ep.consultation_fee, ep.languages,
                   ep.profile_photo, ep.profile_banner, ep.public_description, ep.categories
                   FROM users u
                   JOIN expert_profiles ep ON ep.user_id = u.id
                   WHERE u.role='expert' AND u.is_active=1`;
        const params = [];
        if (search) { sql += ' AND (u.name LIKE ? OR ep.headline LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        sql += ' ORDER BY ep.review_count DESC, ep.rating DESC';
        let experts = await db.allAsync(sql, params);

        if (specialization) {
            experts = experts.filter(e => {
                try { return JSON.parse(e.specializations || '[]').some(s => s.toLowerCase().includes(specialization.toLowerCase())); }
                catch { return false; }
            });
        }
        if (language) {
            experts = experts.filter(e => {
                try { return JSON.parse(e.languages || '[]').some(l => l.toLowerCase().includes(language.toLowerCase())); }
                catch { return false; }
            });
        }
        if (consultation_type) {
            experts = experts.filter(e => {
                try { return JSON.parse(e.consultation_types || '[]').some(t => t.toLowerCase().includes(consultation_type.toLowerCase())); }
                catch { return false; }
            });
        }
        res.json(experts);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/experts/profile/:expertId
const getExpertPublicProfile = async (req, res) => {
    try {
        const expert = await db.getAsync(
            `SELECT u.id, u.name, u.profile_photo as user_photo,
             ep.bio, ep.specializations, ep.experience_years, ep.rating, ep.review_count, ep.is_available,
             ep.headline, ep.consultation_types, ep.consultation_fee, ep.languages,
             ep.profile_photo, ep.profile_banner, ep.public_description, ep.categories
             FROM users u
             JOIN expert_profiles ep ON ep.user_id = u.id
             WHERE u.id=? AND u.role='expert' AND u.is_active=1`,
            [req.params.expertId]
        );
        if (!expert) return res.status(404).json({ message: 'Expert not found' });
        res.json(expert);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// POST /api/experts/apply  (multipart/form-data)
const submitApplication = async (req, res) => {
    try {
        const b = req.body;
        if (!b.name || !b.email) return res.status(400).json({ message: 'Name and email are required' });

        const existing = await db.getAsync('SELECT id, status FROM expert_applications WHERE email=?', [b.email]);
        if (existing) {
            return res.status(400).json({ message: `An application already exists for this email (status: ${existing.status})` });
        }

        const files = req.files || {};
        const profilePhoto = files.profile_photo ? getFilePath(files.profile_photo[0]) : null;
        const certDocs = getFilePaths(files.certification_docs);
        const idDoc = files.id_document ? getFilePath(files.id_document[0]) : null;
        const selfie = files.selfie_photo ? getFilePath(files.selfie_photo[0]) : null;
        const addrProof = files.address_proof ? getFilePath(files.address_proof[0]) : null;
        const sampleReports = getFilePaths(files.sample_reports);
        const banner = files.profile_banner ? getFilePath(files.profile_banner[0]) : null;

        const linkedUser = await db.getAsync('SELECT id FROM users WHERE email=?', [b.email]);

        const initialHistory = JSON.stringify([
            { status: 'submitted', timestamp: new Date().toISOString(), note: 'Application submitted' }
        ]);

        const result = await db.runAsync(
            `INSERT INTO expert_applications (
                name, email, phone, display_name, date_of_birth, gender, nationality, profile_photo,
                address_line1, address_line2, city, state_province, postal_code, country,
                bio, languages_spoken, expertise_areas, specializations, years_experience, current_occupation,
                education_level, qualifications, certifications, certification_docs, training_institute, additional_qualifications,
                consultation_types, services_offered, consultation_fee, availability_schedule, timezone,
                clients_served, years_practice, sample_reports, testimonials,
                social_facebook, social_instagram, social_twitter, social_youtube, website_url, portfolio_url, linkedin_url,
                id_type, id_number, id_document, selfie_photo, address_proof,
                bank_name, account_holder_name, account_number, branch_name, payment_method, tax_id,
                public_display_name, public_description, headline, profile_banner, profile_languages, consultation_categories,
                agreed_terms, agreed_privacy, agreed_nda, electronic_signature, submission_date,
                why_join, status, status_history, linked_user_id
            ) VALUES (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )`,
            [
                b.name, b.email, b.phone||null, b.display_name||null, b.date_of_birth||null, b.gender||null, b.nationality||null, profilePhoto,
                b.address_line1||null, b.address_line2||null, b.city||null, b.state_province||null, b.postal_code||null, b.country||null,
                b.professional_bio||b.bio||null, b.languages_spoken||null, b.expertise_areas||null,
                b.specializations||null, b.years_experience||0, b.current_occupation||null,
                b.education_level||null, b.qualifications||null, b.certifications||null, certDocs, b.training_institute||null, b.additional_qualifications||null,
                b.consultation_types||null, b.services_offered||null, b.consultation_fee||null, b.availability_schedule||null, b.timezone||null,
                b.clients_served||null, b.years_practice||null, sampleReports, b.testimonials||null,
                b.social_facebook||null, b.social_instagram||null, b.social_twitter||null, b.social_youtube||null, b.website_url||null, b.portfolio_url||null, b.linkedin_url||null,
                b.id_type||null, b.id_number||null, idDoc, selfie, addrProof,
                b.bank_name||null, b.account_holder_name||null, b.account_number||null, b.branch_name||null, b.payment_method||null, b.tax_id||null,
                b.public_display_name||null, b.public_description||null, b.headline||null, banner, b.profile_languages||null, b.consultation_categories||null,
                b.agreed_terms ? 1 : 0, b.agreed_privacy ? 1 : 0, b.agreed_nda ? 1 : 0, b.electronic_signature||null, b.submission_date||new Date().toISOString().split('T')[0],
                b.why_join||null, 'submitted', initialHistory, linkedUser?.id||null,
            ]
        );

        // Generate 6-digit PIN and create temp account
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinHash = await bcrypt.hash(pin, 10);
        const accessToken = crypto.randomBytes(32).toString('hex');

        await db.runAsync(
            'INSERT INTO expert_temp_accounts (application_id, email, access_pin_hash, access_token) VALUES (?,?,?,?)',
            [result.lastID, b.email, pinHash, accessToken]
        );

        res.status(201).json({
            message: 'Application submitted successfully.',
            applicationId: result.lastID,
            pin,
            email: b.email,
        });
    } catch (e) {
        console.error('submitApplication error:', e);
        res.status(500).json({ message: e.message });
    }
};

// POST /api/experts/temp-login
const loginTempAccount = async (req, res) => {
    try {
        await cleanupExpiredAccounts();
        const { email, pin } = req.body;
        if (!email || !pin) return res.status(400).json({ message: 'Email and PIN are required' });

        const ta = await db.getAsync(
            'SELECT * FROM expert_temp_accounts WHERE email=? AND is_active=1',
            [email]
        );
        if (!ta) return res.status(404).json({ message: 'No active application found for this email' });

        // Check expiry
        if (ta.account_expires_at) {
            const expires = new Date(ta.account_expires_at);
            if (expires < new Date()) {
                return res.status(403).json({ message: 'This account has been deleted due to application rejection.' });
            }
        }

        const valid = await bcrypt.compare(pin, ta.access_pin_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid PIN' });

        // Refresh access token on login
        const newToken = crypto.randomBytes(32).toString('hex');
        await db.runAsync(
            "UPDATE expert_temp_accounts SET access_token=?, last_login=datetime('now') WHERE id=?",
            [newToken, ta.id]
        );

        const app = await db.getAsync('SELECT * FROM expert_applications WHERE id=?', [ta.application_id]);
        res.json({ token: newToken, application: app });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/experts/temp-application?token=
const getTempApplication = async (req, res) => {
    try {
        await cleanupExpiredAccounts();
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Token required' });

        const ta = await db.getAsync('SELECT * FROM expert_temp_accounts WHERE access_token=? AND is_active=1', [token]);
        if (!ta) return res.status(401).json({ message: 'Invalid or expired session' });

        if (ta.account_expires_at && new Date(ta.account_expires_at) < new Date()) {
            return res.status(403).json({ message: 'Account deleted' });
        }

        const app = await db.getAsync('SELECT * FROM expert_applications WHERE id=?', [ta.application_id]);
        if (!app) return res.status(404).json({ message: 'Application not found' });

        const expiresInfo = ta.account_expires_at ? { account_expires_at: ta.account_expires_at } : {};
        res.json({ ...app, ...expiresInfo });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/experts/status?email=  (legacy public check)
const checkStatus = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const app = await db.getAsync(
            'SELECT id, name, status, rejection_reason, created_at FROM expert_applications WHERE email=?',
            [email]
        );
        if (!app) return res.status(404).json({ message: 'No application found for this email' });
        res.json(app);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// ── USER (any logged-in user) ─────────────────────────────────────────────────

const createRequest = async (req, res) => {
    try {
        const { member_id, subject_name, subject_birth_date, subject_birth_time, subject_birth_place, review_types, report_types, message, assigned_expert_id } = req.body;
        if (!subject_name || !review_types?.length) return res.status(400).json({ message: 'Subject name and at least one review type are required' });

        let bDate = subject_birth_date, bTime = subject_birth_time, bPlace = subject_birth_place, sName = subject_name;
        if (member_id) {
            const member = await db.getAsync('SELECT name, date_of_birth, time_of_birth, birth_place FROM family_members WHERE id=? AND user_id=?', [member_id, req.user.id]);
            if (member) {
                sName = member.name;
                bDate = member.date_of_birth || bDate;
                bTime = member.time_of_birth || bTime;
                bPlace = member.birth_place || bPlace;
            }
        }

        // Validate chosen expert if provided
        let expertId = null;
        if (assigned_expert_id) {
            const expertUser = await db.getAsync("SELECT id FROM users WHERE id=? AND role='expert' AND is_active=1", [assigned_expert_id]);
            if (expertUser) expertId = expertUser.id;
        }

        const result = await db.runAsync(
            `INSERT INTO expert_review_requests (user_id,member_id,subject_name,subject_birth_date,subject_birth_time,subject_birth_place,review_types,report_types,message,assigned_expert_id)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [req.user.id, member_id||null, sName, bDate||null, bTime||null, bPlace||null,
             JSON.stringify(review_types), JSON.stringify(report_types||[]), message||null, expertId]
        );
        const created = await db.getAsync('SELECT * FROM expert_review_requests WHERE id=?', [result.lastID]);
        res.status(201).json(created);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const requests = await db.allAsync(
            `SELECT r.*, u.name as expert_name FROM expert_review_requests r
             LEFT JOIN users u ON u.id = r.assigned_expert_id
             WHERE r.user_id=? ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(requests);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getMyRequest = async (req, res) => {
    try {
        const request = await db.getAsync(
            `SELECT r.*, u.name as expert_name, ep.bio as expert_bio, ep.rating as expert_rating
             FROM expert_review_requests r
             LEFT JOIN users u ON u.id = r.assigned_expert_id
             LEFT JOIN expert_profiles ep ON ep.user_id = r.assigned_expert_id
             WHERE r.id=? AND r.user_id=?`,
            [req.params.id, req.user.id]
        );
        if (!request) return res.status(404).json({ message: 'Request not found' });
        const review = await db.getAsync('SELECT * FROM expert_reviews WHERE request_id=?', [request.id]);
        res.json({ ...request, review: review || null });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const cancelRequest = async (req, res) => {
    try {
        const request = await db.getAsync('SELECT id, status FROM expert_review_requests WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status === 'completed') return res.status(400).json({ message: 'Cannot cancel a completed request' });
        await db.runAsync("UPDATE expert_review_requests SET status='cancelled', updated_at=datetime('now') WHERE id=?", [request.id]);
        res.json({ message: 'Request cancelled' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// ── EXPERT ────────────────────────────────────────────────────────────────────

const getQueue = async (req, res) => {
    try {
        // Returns unassigned pending requests + requests specifically assigned to this expert
        const requests = await db.allAsync(
            `SELECT r.*, u.name as requester_name FROM expert_review_requests r
             JOIN users u ON u.id = r.user_id
             WHERE r.status='pending' AND (r.assigned_expert_id IS NULL OR r.assigned_expert_id=?)
             ORDER BY r.assigned_expert_id DESC, r.created_at ASC`,
            [req.user.id]
        );
        res.json(requests);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const request = await db.getAsync('SELECT id, status FROM expert_review_requests WHERE id=?', [req.params.id]);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ message: 'Request is no longer available' });
        await db.runAsync(
            "UPDATE expert_review_requests SET status='in_review', assigned_expert_id=?, updated_at=datetime('now') WHERE id=?",
            [req.user.id, request.id]
        );
        res.json({ message: 'Request accepted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const submitReview = async (req, res) => {
    try {
        const { personal_reading, career_guidance, relationship_insights, life_forecasts, financial_astrology, health_tendencies, electional_astrology, spiritual_growth, lucky_dates, summary } = req.body;
        if (!summary) return res.status(400).json({ message: 'Summary is required' });

        const request = await db.getAsync('SELECT id, status, assigned_expert_id FROM expert_review_requests WHERE id=?', [req.params.id]);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.assigned_expert_id !== req.user.id) return res.status(403).json({ message: 'Not your assignment' });
        if (request.status !== 'in_review') return res.status(400).json({ message: 'Request must be in_review status' });

        const existingReview = await db.getAsync('SELECT id FROM expert_reviews WHERE request_id=?', [request.id]);
        if (existingReview) {
            await db.runAsync(
                `UPDATE expert_reviews SET personal_reading=?,career_guidance=?,relationship_insights=?,life_forecasts=?,financial_astrology=?,health_tendencies=?,electional_astrology=?,spiritual_growth=?,lucky_dates=?,summary=?,updated_at=datetime('now') WHERE request_id=?`,
                [personal_reading||null, career_guidance||null, relationship_insights||null, life_forecasts||null, financial_astrology||null, health_tendencies||null, electional_astrology||null, spiritual_growth||null, lucky_dates||null, summary, request.id]
            );
        } else {
            await db.runAsync(
                `INSERT INTO expert_reviews (request_id,expert_id,personal_reading,career_guidance,relationship_insights,life_forecasts,financial_astrology,health_tendencies,electional_astrology,spiritual_growth,lucky_dates,summary)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                [request.id, req.user.id, personal_reading||null, career_guidance||null, relationship_insights||null, life_forecasts||null, financial_astrology||null, health_tendencies||null, electional_astrology||null, spiritual_growth||null, lucky_dates||null, summary]
            );
        }
        await db.runAsync("UPDATE expert_review_requests SET status='completed', updated_at=datetime('now') WHERE id=?", [request.id]);
        await db.runAsync("UPDATE expert_profiles SET review_count = review_count + 1 WHERE user_id=?", [req.user.id]);
        res.json({ message: 'Review submitted successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getMyWork = async (req, res) => {
    try {
        const requests = await db.allAsync(
            `SELECT r.*, u.name as requester_name FROM expert_review_requests r
             JOIN users u ON u.id = r.user_id WHERE r.assigned_expert_id=? ORDER BY r.updated_at DESC`,
            [req.user.id]
        );
        res.json(requests);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const profile = await db.getAsync('SELECT * FROM expert_profiles WHERE user_id=?', [req.user.id]);
        res.json(profile || { user_id: req.user.id, bio: '', specializations: '[]', experience_years: 0, rating: 0, review_count: 0, is_available: 1 });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const b = req.body;
        const files = req.files || {};
        const photoFile = files.profile_photo ? getFilePath(files.profile_photo[0]) : undefined;
        const bannerFile = files.profile_banner ? getFilePath(files.profile_banner[0]) : undefined;

        const existing = await db.getAsync('SELECT * FROM expert_profiles WHERE user_id=?', [req.user.id]);

        const arrField = (v) => {
            if (!v) return null;
            if (Array.isArray(v)) return JSON.stringify(v);
            try { JSON.parse(v); return v; } catch { return JSON.stringify([v]); }
        };

        const data = {
            bio: b.bio || null,
            specializations: arrField(b.specializations),
            experience_years: b.experience_years || 0,
            is_available: b.is_available !== undefined ? (b.is_available === 'true' || b.is_available === '1' || b.is_available === true ? 1 : 0) : 1,
            headline: b.headline || null,
            consultation_types: arrField(b.consultation_types),
            consultation_fee: b.consultation_fee || null,
            languages: arrField(b.languages),
            public_description: b.public_description || null,
            categories: arrField(b.categories),
            profile_photo: photoFile !== undefined ? photoFile : (existing?.profile_photo || null),
            profile_banner: bannerFile !== undefined ? bannerFile : (existing?.profile_banner || null),
        };

        if (existing) {
            await db.runAsync(
                `UPDATE expert_profiles SET bio=?,specializations=?,experience_years=?,is_available=?,
                 headline=?,consultation_types=?,consultation_fee=?,languages=?,public_description=?,categories=?,profile_photo=?,profile_banner=?
                 WHERE user_id=?`,
                [data.bio, data.specializations, data.experience_years, data.is_available,
                 data.headline, data.consultation_types, data.consultation_fee, data.languages,
                 data.public_description, data.categories, data.profile_photo, data.profile_banner,
                 req.user.id]
            );
        } else {
            await db.runAsync(
                `INSERT INTO expert_profiles (user_id,bio,specializations,experience_years,is_available,headline,consultation_types,consultation_fee,languages,public_description,categories,profile_photo,profile_banner)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [req.user.id, data.bio, data.specializations, data.experience_years, data.is_available,
                 data.headline, data.consultation_types, data.consultation_fee, data.languages,
                 data.public_description, data.categories, data.profile_photo, data.profile_banner]
            );
        }
        const updated = await db.getAsync('SELECT * FROM expert_profiles WHERE user_id=?', [req.user.id]);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

const getApplications = async (req, res) => {
    try {
        const { status = '', search = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let sql = 'SELECT * FROM expert_applications WHERE 1=1';
        const params = [];
        if (status) { sql += ' AND status=?'; params.push(status); }
        if (search) { sql += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const apps = await db.allAsync(sql, params);
        const total = await db.getAsync('SELECT COUNT(*) as cnt FROM expert_applications WHERE 1=1' + (status ? ' AND status=?' : ''), status ? [status] : []);
        res.json({ applications: apps, total: total.cnt });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const approveApplication = async (req, res) => {
    try {
        const app = await db.getAsync('SELECT * FROM expert_applications WHERE id=?', [req.params.id]);
        if (!app) return res.status(404).json({ message: 'Application not found' });
        if (app.status === 'approved') return res.status(400).json({ message: 'Application already approved' });

        let userId = app.linked_user_id;
        if (!userId) {
            const tempPassword = Math.random().toString(36).slice(-10);
            const hash = await bcrypt.hash(tempPassword, 10);
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1);
            const result = await db.runAsync(
                `INSERT INTO users (name,email,password,role,membership_plan,membership_expiry,email_verified,is_active) VALUES (?,?,?,'expert','free',?,1,1)`,
                [app.name, app.email, hash, expiry.toISOString()]
            );
            userId = result.lastID;
            await db.runAsync('UPDATE expert_applications SET linked_user_id=? WHERE id=?', [userId, app.id]);
            console.log(`✅ Expert account created: ${app.email} / ${tempPassword}`);
        } else {
            await db.runAsync("UPDATE users SET role='expert' WHERE id=?", [userId]);
        }

        const existing = await db.getAsync('SELECT id FROM expert_profiles WHERE user_id=?', [userId]);
        if (!existing) {
            await db.runAsync(
                'INSERT INTO expert_profiles (user_id, bio, specializations, experience_years) VALUES (?,?,?,?)',
                [userId, app.bio||null, app.specializations||'[]', app.experience_years||0]
            );
        }

        const history = JSON.parse(app.status_history || '[]');
        history.push({ status: 'approved', timestamp: new Date().toISOString(), note: 'Application approved by admin' });
        await db.runAsync(
            "UPDATE expert_applications SET status='approved', status_history=? WHERE id=?",
            [JSON.stringify(history), app.id]
        );
        res.json({ message: 'Application approved. Expert account activated.' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const rejectApplication = async (req, res) => {
    try {
        const { rejection_reason } = req.body;
        const app = await db.getAsync('SELECT id, status, status_history FROM expert_applications WHERE id=?', [req.params.id]);
        if (!app) return res.status(404).json({ message: 'Application not found' });
        if (app.status === 'rejected') return res.status(400).json({ message: 'Application already rejected' });

        const rejectedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const history = JSON.parse(app.status_history || '[]');
        history.push({ status: 'rejected', timestamp: rejectedAt, note: rejection_reason || 'Application rejected by admin' });

        await db.runAsync(
            "UPDATE expert_applications SET status='rejected', rejection_reason=?, rejected_at=?, status_history=? WHERE id=?",
            [rejection_reason||null, rejectedAt, JSON.stringify(history), app.id]
        );

        // Set temp account expiry to 24 hours from now
        await db.runAsync(
            'UPDATE expert_temp_accounts SET account_expires_at=? WHERE application_id=?',
            [expiresAt, app.id]
        );

        res.json({ message: 'Application rejected. Temp account will be deleted in 24 hours.' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const validStatuses = ['submitted', 'under_review', 'interview_scheduled', 'suspended'];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const app = await db.getAsync('SELECT id, status_history FROM expert_applications WHERE id=?', [req.params.id]);
        if (!app) return res.status(404).json({ message: 'Application not found' });

        const history = JSON.parse(app.status_history || '[]');
        history.push({ status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` });

        await db.runAsync(
            'UPDATE expert_applications SET status=?, status_history=? WHERE id=?',
            [status, JSON.stringify(history), app.id]
        );
        res.json({ message: 'Status updated' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getExperts = async (req, res) => {
    try {
        const experts = await db.allAsync(
            `SELECT u.id, u.name, u.email, u.is_active, u.created_at,
                    ep.bio, ep.specializations, ep.experience_years, ep.rating, ep.review_count, ep.is_available
             FROM users u LEFT JOIN expert_profiles ep ON ep.user_id = u.id
             WHERE u.role='expert' ORDER BY ep.review_count DESC`
        );
        res.json(experts);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getAllRequests = async (req, res) => {
    try {
        const { status = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let sql = `SELECT r.*, u.name as requester_name, e.name as expert_name
                   FROM expert_review_requests r
                   JOIN users u ON u.id = r.user_id
                   LEFT JOIN users e ON e.id = r.assigned_expert_id WHERE 1=1`;
        const params = [];
        if (status) { sql += ' AND r.status=?'; params.push(status); }
        sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const requests = await db.allAsync(sql, params);
        const total = await db.getAsync('SELECT COUNT(*) as cnt FROM expert_review_requests' + (status ? ' WHERE status=?' : ''), status ? [status] : []);
        res.json({ requests, total: total.cnt });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = {
    browseExperts, getExpertPublicProfile,
    submitApplication, checkStatus, loginTempAccount, getTempApplication,
    createRequest, getMyRequests, getMyRequest, cancelRequest,
    getQueue, acceptRequest, submitReview, getMyWork, getMyProfile, updateMyProfile,
    getApplications, approveApplication, rejectApplication, updateApplicationStatus, getExperts, getAllRequests,
};
