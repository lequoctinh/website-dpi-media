const mysql = require('mysql2/promise');

function need(name) {
const v = process.env[name];
if (v === undefined || v === '') {
    throw new Error(`Missing env: ${name}`);
}
return v;
}

const pool = mysql.createPool({
host: need('DB_HOST'),
user: need('DB_USER'),
password: process.env.DB_PASSWORD || '',
database: need('DB_NAME'),
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0,
charset: 'utf8mb4_general_ci',
timezone: 'Z',
});

module.exports = pool;
