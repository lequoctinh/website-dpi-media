
const bcrypt = require("bcrypt");
const pool = require("../db"); 

const CLI_USER = process.argv[2];
const CLI_PASS = process.argv[3];

const USERNAME = CLI_USER || process.env.SEED_USERNAME || "info@dpimedia.pro";
const PLAIN_PW = CLI_PASS || process.env.SEED_PASSWORD || "dpi@media@2025";
const SALT_ROUNDS = Number(process.env.SEED_SALT_ROUNDS || 10);

(async () => {
try {

    await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);


    const [existing] = await pool.query(
    "SELECT id FROM admin_users WHERE username = ? LIMIT 1",
    [USERNAME]
    );
    if (existing.length) {
    console.log(`ℹ User đã tồn tại: ${USERNAME} (id=${existing[0].id}). Bỏ qua.`);
    process.exit(0);
    }


    const hash = await bcrypt.hash(PLAIN_PW, SALT_ROUNDS);
    await pool.query(
    "INSERT INTO admin_users (username, password) VALUES (?, ?)",
    [USERNAME, hash]
    );

    console.log("✅ Seed admin thành công!");
    console.log("   Username:", USERNAME);
    console.log("   Password:", PLAIN_PW); 
    process.exit(0);
} catch (e) {
    console.error("❌ Seed lỗi:", e.message);
    process.exit(1);
}
})();
