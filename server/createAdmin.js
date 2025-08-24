const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Cấu hình DB
const db = mysql.createConnection({
host: "localhost",
user: "root",
password: "", 
database: "mediatp", 
});

// Tạo admin
const username = "admin";
const plainPassword = "admin@2512";
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
if (err) throw err;

const query = "INSERT INTO admin_users (username, password) VALUES (?, ?)";
db.query(query, [username, hash], (err, result) => {
    if (err) throw err;
    console.log("✅ Admin account created!");
    db.end();
});
});
