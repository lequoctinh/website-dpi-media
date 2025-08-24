// backend/routes/emailRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Cấu hình lưu file vào thư mục /uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
},
filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
},
});
const upload = multer({ storage });

// ROUTE GỬI FORM BÁO GIÁ
router.post('/quote', upload.single('file'), async (req, res) => {
const {
    name,
    phone,
    email,
    type,
    duration,
    deadline,
    budget,
    note,
    contactMethod,
} = req.body;

let goals = [];
try {
    goals = JSON.parse(req.body.goals);
} catch (e) {
    goals = [];
}

const file = req.file;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: process.env.GMAIL_USER, // Lấy từ .env
    pass: process.env.GMAIL_PASS, // Lấy từ .env
    },
});

const mailOptions = {
    from: `"Báo Giá Zen" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: '📝 Yêu cầu báo giá mới từ khách hàng',
    html: `
    <h2>Thông tin khách hàng:</h2>
    <ul>
        <li><strong>Họ tên:</strong> ${name}</li>
        <li><strong>SĐT:</strong> ${phone}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Loại dự án:</strong> ${type}</li>
        <li><strong>Thời lượng:</strong> ${duration}</li>
        <li><strong>Mục tiêu:</strong> ${goals.join(', ')}</li>
        <li><strong>Deadline:</strong> ${deadline}</li>
        <li><strong>Ngân sách:</strong> ${budget}</li>
        <li><strong>Liên hệ qua:</strong> ${contactMethod}</li>
        <li><strong>Ghi chú:</strong> ${note}</li>
    </ul>
    `,
};

if (file) {
    mailOptions.attachments = [
    {
        filename: file.originalname,
        path: file.path,
    },
    ];
}

try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Gửi báo giá thành công!' });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không gửi được báo giá.' });
}
});
router.post('/send', async (req, res) => {
const { email } = req.body;

if (!email) return res.status(400).json({ error: 'Email is required' });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'dpimedia2024@gmail.com',        
    pass: 'ihxauqmvajefkhiw'            
    },
});

try {
    await transporter.sendMail({
    from: '"Website Form" <dpimedia2024@gmail.com>', 
    to: 'dpimedia2024@gmail.com',                     
    subject: 'New Subscriber',
    text: `Khách hàng vừa đăng ký: ${email}`,
});


    res.status(200).json({ message: 'Gửi thành công!' });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gửi thất bại' });
}
});

module.exports = router;
