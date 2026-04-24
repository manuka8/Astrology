const initDb = require('./utils/initDb');

const test = async () => {
    await initDb();
    process.exit(0);
};

test();
