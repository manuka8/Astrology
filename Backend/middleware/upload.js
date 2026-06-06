const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const expertFields = ['profile_photo', 'certification_docs', 'id_document', 'selfie_photo', 'address_proof', 'sample_reports', 'profile_banner'];
        let folder = 'uploads/misc';
        if (file.fieldname === 'profile_photo') folder = 'uploads/profiles';
        else if (file.fieldname === 'horoscope_pdf') folder = 'uploads/horoscopes';
        else if (file.fieldname === 'cover_image') folder = 'uploads/articles';
        else if (expertFields.includes(file.fieldname)) folder = `uploads/experts/${file.fieldname}`;
        ensureDir(path.join(__dirname, '..', folder));
        cb(null, path.join(__dirname, '..', folder));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = /image|pdf/.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Multi-field upload for expert applications
const expertUpload = upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'certification_docs', maxCount: 5 },
    { name: 'id_document', maxCount: 1 },
    { name: 'selfie_photo', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'sample_reports', maxCount: 5 },
    { name: 'profile_banner', maxCount: 1 },
]);

module.exports = upload;
module.exports.expertUpload = expertUpload;
