const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const fs = require('fs');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();

app.use(express.json())
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

const data = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});

data.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "0.0.0.0";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_DIR || './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRE_IN = process.env.JWT_EXPIRE_IN;

const processRefund = async (paymentId, amount, orderId, itemTitle) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(amount * 100),
            speed: 'normal',
            notes: {
                reason: 'Order cancellation',
                order_id: orderId,
                item: itemTitle
            }
        });

        console.log('Refund created successfully:', refund);
        return {
            success: true,
            refund_id: refund.id,
            amount: refund.amount / 100,
            status: refund.status
        };
    } catch (error) {
        console.error('Refund failed:', error);
        return {
            success: false,
            error: error.message || 'Refund processing failed'
        };
    }
};

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/additem', upload.single('image'), (req, res) => {
    const { title, price, quantity, category, shipping } = req.body;
    const image = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    let sql = 'INSERT INTO formdata (title, price, image, quantity, category, shipping) VALUES ( ?, ?, ?, ?, ?, ?)';
    data.query(sql, [title, price, image, quantity, category, shipping], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error saving data');
            return;
        }
        res.status(200).send("data save successfully")
    });
});

app.get('/getdata', (req, res) => {
    let sql = 'SELECT * FROM formdata';
    data.query(sql, (err, result) => {
        if (err) return res.json(err);
        return res.json(result)
    });
});

app.delete('/deleteitem/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM formdata WHERE id = ?';
    data.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting item:", err);
            return res.status(500).send('Failed to delete item');
        }
        res.status(200).send('Item delete successfully');
    });
});

app.post('/signin', async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const { username, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql1 = "SELECT * FROM signup WHERE email = ?";
    data.query(sql1, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Error checking existing user' });

        if (result.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        let hash;
        try {
            hash = await bcrypt.hash(password, SALT_ROUNDS);
        } catch (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        const sql2 = 'INSERT INTO signup(username, email, password) VALUES(?, ?, ?)';
        data.query(sql2, [username, email, hash], (err2, result2) => {
            if (err2) return res.status(500).json({ message: 'Error inserting user' });

            const userId = result2.insertId;
            const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: EXPIRE_IN });
            return res.status(200).json({ message: 'Signup successful', token });
        });
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM signup WHERE email = ?";

    data.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (!result || result.length === 0) return res.status(404).json({ message: "User not found" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: EXPIRE_IN });
        return res.status(200).json({ message: "Login successful", token });
    });
});

app.post('/sendEmail', (req, res) => {
    const { name, email, subject, message } = req.body;

    const mailOption = {
        from: email,
        to: process.env.EMAIL_FROM,
        subject: subject,
        text: `Name: ${name} \n Email: ${email} \n Message: ${message}`,
    };

    transporter.sendMail(mailOption, (error, result) => {
        if (error) {
            console.error('Error sending email', error);
            return res.status(500).json({ message: "Database error" });
        }
        else {
            console.log('Email sent:', result.response);
            res.status(200).send('Email send successfully');
        }
    });
});

const otpStore = new Map();
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const checkEmailSQL = "SELECT * FROM signup WHERE email = ?";
    data.query(checkEmailSQL, [email.toLowerCase().trim()], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Email not found in our records' });
        }

        const otp = generateOTP();
        const expiryTime = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

        otpStore.set(email.toLowerCase().trim(), {
            otp: otp,
            expiryTime: expiryTime,
            verified: false
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h3 style="color: #007bff; margin: 0;">Your OTP Code</h3>
                        <div style="font-size: 32px; font-weight: bold; color: #333; margin: 20px 0; letter-spacing: 5px; background: white; padding: 15px; border-radius: 5px; display: inline-block;">
                            ${OTP_EXPIRY_MINUTES}
                        </div>
                        <p style="color: #666; margin: 0;">This OTP will expire in 10 minutes</p>
                    </div>
                    <p style="color: #666; text-align: center;">
                        If you didn't request a password reset, please ignore this email.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (mailErr) => {
            if (mailErr) {
                console.error('Error sending OTP email:', mailErr);
                return res.status(500).json({ message: 'Error sending OTP email' });
            }

            console.log('OTP sent to:', email);
            res.json({
                message: 'OTP sent to your email address. Please check your inbox.',
                success: true
            });
        });
    });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const emailKey = email.toLowerCase().trim();
    const storedData = otpStore.get(emailKey);

    if (!storedData) {
        return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > storedData.expiryTime) {
        otpStore.delete(emailKey);
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp.toString()) {
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    storedData.verified = true;
    otpStore.set(emailKey, storedData);

    res.json({
        message: 'OTP verified successfully!',
        success: true
    });
});

app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const emailKey = email.toLowerCase().trim();
    const storedData = otpStore.get(emailKey);

    if (!storedData || !storedData.verified) {
        return res.status(400).json({ message: 'OTP verification required. Please verify OTP first.' });
    }

    if (Date.now() > storedData.expiryTime + 20 * 60 * 1000) {
        otpStore.delete(emailKey);
        return res.status(400).json({ message: 'Verification session expired. Please start over.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const updatePasswordSQL = "UPDATE signup SET password = ? WHERE email = ?";
        data.query(updatePasswordSQL, [hashedPassword, emailKey], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ message: 'Error updating password' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            otpStore.delete(emailKey);

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Password Reset Successful',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #28a745; text-align: center;">Password Reset Successful</h2>
                        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #28a745;">
                            <p style="color: #155724; margin: 0; font-size: 16px;">
                                Your password has been successfully reset on ${new Date().toLocaleString('en-IN')}.
                            </p>
                        </div>
                        <p style="color: #666; text-align: center;">
                            If you didn't make this change, please contact our support team immediately.
                        </p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) {
                    console.error('Error sending confirmation email:', mailErr);
                }
            });

            res.json({
                message: 'Password reset successfully! You can now login with your new password.',
                success: true
            });
        });

    } catch (hashErr) {
        console.error('Error hashing password:', hashErr);
        res.status(500).json({ message: 'Error processing password' });
    }
});

setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiryTime + 30 * 60 * 1000) {
            otpStore.delete(email);
        }
    }
}, 5 * 60 * 1000);

app.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        });
        return res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Razorpay error');
    }
});

app.post("/update-status", (req, res) => {
    const { newStatus, orderId } = req.body;
    const updateOrderSQL = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?";
    data.query(updateOrderSQL, [newStatus, orderId], (err, result) => {
        if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).send("Error updating status");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Order not found");
        }

        const updateItemsSQL = "UPDATE order_items SET status = ? WHERE order_id = ?";
        data.query(updateItemsSQL, [newStatus, orderId], (itemErr) => {
            if (itemErr) {
                console.error("Error updating order items status:", itemErr);
            }
        });

        sendStatusUpdateEmail(orderId, newStatus);

        res.send(`
            <html>
                <head>
                    <title>Status Updated</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .success { color: #28a745; font-size: 24px; margin: 20px 0; }
                        .order-id { color: #6c757d; font-size: 18px; }
                        .btn { 
                            background: #007bff; 
                            color: white; 
                            padding: 10px 20px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            margin: 10px;
                        }
                    </style>
                </head>
                <body>
                    <h1 class="success">✓ Status Updated Successfully!</h1>
                    <p class="order-id">Order #${orderId} updated to: <strong>${newStatus}</strong></p>
                    <p>Timestamp: ${new Date().toLocaleString('en-IN')}</p>
                    <br>
                    <a href="#" onclick="window.close()" class="btn">Close Window</a>
                </body>
            </html>
        `);
    });
});

app.post("/update-status/:orderId/:newStatus", (req, res) => {
    const { newStatus, orderId } = req.params;
    const validStatuses = ['Packed', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).send(`
            <html>
                <head>
                    <title>Invalid Status</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc3545; font-size: 24px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <h1 class="error">❌ Invalid Status</h1>
                    <p>The status "${newStatus}" is not valid.</p>
                </body>
            </html>
        `);
    }

    const updateOrderItemsSQL = "UPDATE order_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?";
    data.query(updateOrderItemsSQL, [newStatus, orderId], (err, result) => {
        if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).send(`
                <html>
                    <head>
                        <title>Error</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #dc3545; font-size: 24px; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <h1 class="error">❌ Error</h1>
                        <p>Error updating order status</p>
                    </body>
                </html>
            `);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send(`
                <html>
                    <head>
                        <title>Order Not Found</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #dc3545; font-size: 24px; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <h1 class="error">❌ Order Not Found</h1>
                        <p>Order #${orderId} not found</p>
                    </body>
                </html>
            `);
        }

        console.log(`Order ${orderId} status updated to ${newStatus}. Affected rows: ${result.affectedRows}`);

        // Also try to update orders table if it exists
        const updateOrderSQL = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?";
        data.query(updateOrderSQL, [newStatus, orderId], (orderErr) => {
            if (orderErr) {
                console.log("Orders table might not exist or error updating:", orderErr.message);
            }
        });

        sendStatusUpdateEmail(orderId, newStatus);

        res.send(`
            <html>
                <head>
                    <title>Status Updated</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: #f8f9fa;
                        }
                        .container {
                            background: white;
                            padding: 40px;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            max-width: 500px;
                            margin: 0 auto;
                        }
                        .success {
                            color: #28a745;
                            font-size: 24px;
                            margin: 20px 0;
                        }
                        .order-id {
                            color: #6c757d;
                            font-size: 18px;
                            margin: 15px 0;
                        }
                        .status-badge {
                            background: #28a745;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-weight: bold;
                            display: inline-block;
                            margin: 10px 0;
                        }
                        .btn {
                            background: #007bff;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 10px;
                            border: none;
                            cursor: pointer;
                            font-size: 16px;
                        }
                        .btn:hover {
                            background: #0056b3;
                        }
                        .timestamp {
                            color: #6c757d;
                            font-size: 14px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="success">✓ Status Updated Successfully!</h1>
                        <p class="order-id">Order #${orderId}</p>
                        <div class="status-badge">${newStatus}</div>
                        <p>Customer has been notified via email</p>
                        <div class="timestamp">Updated on: ${new Date().toLocaleString('en-IN')}</div>
                        <br>
                        <button onclick="window.close()" class="btn">Close Window</button>
                    </div>
                </body>
            </html>
        `);
    });
});

const sendStatusUpdateEmail = (orderId, newStatus) => {
    const getCustomerSQL = "SELECT * FROM order_items WHERE order_id = ? LIMIT 1";
    data.query(getCustomerSQL, [orderId], (err, results) => {
        if (err || results.length === 0) {
            console.error("Error fetching customer details for email:", err);
            return;
        }

        const customer = results[0];

        const getStatusMessage = (status) => {
            switch (status) {
                case 'Packed': return 'Your order has been packed and is ready for shipping.';
                case 'Shipped': return 'Your order has been shipped and is on its way to you.';
                case 'Delivered': return 'Your order has been delivered successfully.';
                default: return 'Your order status has been updated.';
            }
        };

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: customer.customer_email,
            subject: `Order Status Update - ${orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Order Status Update</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #28a745; margin: 0 0 10px 0;">Status: ${newStatus}</h3>
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Customer:</strong> ${customer.customer_name}</p>
                        <p><strong>Updated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
                    </div>
                    <p>${getStatusMessage(newStatus)}</p>
                    <p style="color: #6c757d; font-size: 14px;">
                        Thank you for shopping with us!<br>
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (mailErr) => {
            if (mailErr) {
                console.error('Error sending status update email:', mailErr);
            } else {
                console.log('Status update email sent to:', customer.customer_email);
            }
        });
    });
};

app.post('/verify-payment', async (req, res) => {
    const { orderId, paymentId, signature, customer } = req.body;
    const items = customer.items || [];
    const itemDetails = items
        .map(
            (item, i) =>
                `${i + 1}. ${item.title} (₹${item.Price} × ${item.quantity}) = ₹${item.Price * item.quantity}`
        )
        .join('\n');

    const body = orderId + '|' + paymentId;
    const expected = crypto
        .createHmac('sha256', razorpay.key_secret)
        .update(body)
        .digest('hex');

    if (expected !== signature)
        return res.status(400).send('Invalid signature');

    const file = path.join(__dirname, 'payments.xlsx');
    const wb = new ExcelJS.Workbook();
    if (fs.existsSync(file)) await wb.xlsx.readFile(file);
    const ws =
        wb.getWorksheet('Payments') || wb.addWorksheet('Payments');

    if (ws.rowCount === 0)
        ws.addRow([
            'Date',
            'Order ID',
            'Payment ID',
            'Name',
            'Phone',
            'Address',
            'City',
            'State',
            'Pincode',
            'Notes',
            'Amount (₹)'
        ]);

    ws.addRow([
        new Date().toLocaleString('en-IN'),
        orderId,
        paymentId,
        customer.name,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
        customer.pincode,
        customer.notes,
        customer.amount
    ]);

    await wb.xlsx.writeFile(file);

    const mail = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_FROM,
        subject: `New order paid – ${orderId}`,
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                🎉 New Order Received!
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
                <p style="margin: 5px 0;"><b>Name:</b> ${customer.name}</p>
                <p style="margin: 5px 0;"><b>Phone:</b> ${customer.phone}</p>
                <p style="margin: 5px 0;"><b>Email:</b> ${customer.email}</p>
                <p style="margin: 5px 0;"><b>Address:</b> ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}</p>
                ${customer.notes ? `<p style="margin: 5px 0;"><b>Notes:</b> ${customer.notes}</p>` : ''}
            </div>

            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                <p style="margin: 5px 0;"><b>Order ID:</b> ${orderId}</p>
                <p style="margin: 5px 0;"><b>Payment ID:</b> ${paymentId}</p>
                <p style="margin: 5px 0;"><b>Total Amount:</b> ₹${customer.amount}</p>
                <p style="margin: 5px 0;"><b>Order Date:</b> ${new Date().toLocaleString('en-IN')}</p>
            </div>

            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                <pre style="background: white; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap;">${itemDetails}</pre>
            </div>

            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #333; margin-top: 0;">Quick Actions</h3>
                <p style="margin-bottom: 15px;">Click to update order status:</p>
            </div>
        </div>
            `
    };

    transporter.sendMail(mail, err =>
        err ? console.error(err) : console.log('Mail sent!')
    );

    console.log('Attempting to save order to database...');
    console.log('Customer data:', customer);

    const insertPromises = items.map((item) => {
        const insertOrderItemQuery = `
                INSERT INTO order_items 
                (order_id, payment_id, item_id, item_title, item_price, item_category, 
                item_quantity, item_image, item_subtotal, customer_name, customer_phone, 
                customer_address, customer_city, customer_state, customer_pincode, 
                customer_email, customer_notes, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

        const queryParams = [
            orderId,
            paymentId,
            item.id || null,
            item.title || '',
            item.Price || item.price || 0,
            item.category || '',
            item.quantity || 1,
            item.image || '',
            (item.Price || item.price || 0) * (item.quantity || 1),
            customer.name || '',
            customer.phone || '',
            customer.address || '',
            customer.city || '',
            customer.state || '',
            customer.pincode || '',
            customer.email || null,
            customer.notes || '',
            customer.amount || 0
        ];

        return new Promise((resolve, reject) => {
            data.query(insertOrderItemQuery, queryParams, (err, result) => {
                if (err) {
                    console.error('DB Insert Error for item:', item.title, err);
                    reject(err);
                } else {
                    console.log('Item saved successfully:', item.title);
                    resolve(result);
                }
            });
        });
    });

    try {
        await Promise.all(insertPromises);
        console.log('All items saved successfully!');
    } catch (error) {
        console.error('Error saving some items:', error);
    }

    res.json({ ok: true });
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

app.get('/order-status/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    const sql = "SELECT * FROM order_items WHERE order_id = ? LIMIT 1";
    data.query(sql, [orderId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching order status' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({
            order_id: orderId,
            status: result[0].status,
            last_updated: result[0].updated_at
        });
    });
});

app.get('/admin/orders', (req, res) => {
    const sql = `
        SELECT o.*,
                COUNT(oi.id) as item_count,
                GROUP_CONCAT(oi.item_title SEPARATOR ', ') as items
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY o.order_id
        ORDER BY o.created_at DESC
    `;

    data.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching orders' });
        }
        res.json(results);
    });
});

app.get('/user-orders', verifyToken, (req, res) => {
    const userEmail = req.user.email;

    console.log('Fetching orders for email:', userEmail);

    const sql = 'SELECT * FROM order_items WHERE customer_email = ? ORDER BY created_at DESC, order_id';

    data.query(sql, [userEmail], (err, result) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ message: 'Error fetching orders' });
        }

        console.log('Raw query result:', result);

        if (!result || result.length === 0) {
            console.log('No orders found for user:', userEmail);
            return res.json([]);
        }

        const groupedOrders = {};
        result.forEach(item => {
            if (!groupedOrders[item.order_id]) {
                groupedOrders[item.order_id] = {
                    order_id: item.order_id,
                    payment_id: item.payment_id,
                    customer_name: item.customer_name,
                    customer_phone: item.customer_phone,
                    customer_address: item.customer_address,
                    customer_city: item.customer_city,
                    customer_state: item.customer_state,
                    customer_pincode: item.customer_pincode,
                    customer_email: item.customer_email,
                    customer_notes: item.customer_notes,
                    total_amount: item.total_amount,
                    orderStatus: item.orderStatus || item.status || 'Order Placed',
                    created_at: item.created_at,
                    items: []
                };
            }

            groupedOrders[item.order_id].items.push({
                id: item.id, // This is the primary key from order_items table
                item_id: item.item_id, // This is the original item ID from formdata
                title: item.item_title,
                Price: item.item_price,
                price: item.item_price,
                category: item.item_category,
                quantity: item.item_quantity,
                image: item.item_image,
                subtotal: item.item_subtotal,
                status: item.status || item.orderStatus || 'Order Placed',
                created_at: item.created_at
            });
        });

        const orders = Object.values(groupedOrders);

        console.log(`Returning ${orders.length} orders with ${result.length} total items for ${userEmail}`);
        return res.json(orders);
    });
});

app.delete('/cancel-order/:itemId', verifyToken, async (req, res) => {
    const itemId = req.params.itemId;
    const userEmail = req.user.email;

    console.log('Received itemId:', itemId);
    console.log('User email:', userEmail);

    // Validate itemId
    if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }

    // First, get the item details before deletion
    const getItemSQL = 'SELECT * FROM order_items WHERE id = ? AND customer_email = ? LIMIT 1';
    
    data.query(getItemSQL, [parseInt(itemId), userEmail], async (err, results) => {
        if (err) {
            console.error('Error fetching item:', err);
            return res.status(500).json({ message: 'Error fetching item' });
        }

        if (results.length === 0) {
            console.log('No item found for itemId:', itemId, 'and email:', userEmail);
            return res.status(404).json({ message: 'Order item not found or unauthorized' });
        }

        const item = results[0];
        console.log('Found item:', item);

        // Check if order is already delivered
        if (item.status && item.status.toLowerCase() === 'delivered') {
            return res.status(400).json({ 
                message: 'Cannot cancel delivered orders. Please contact support for returns.' 
            });
        }

        // Check cancellation time limit (24 hours)
        const itemDate = new Date(item.created_at);
        const now = new Date();
        const diffHours = (now - itemDate) / (1000 * 60 * 60);

        if (diffHours > 24) {
            return res.status(400).json({
                message: 'Cannot cancel order. Cancellation period (24 hours) has expired.'
            });
        }

        let refundResult = null;

        // Process refund if payment_id exists
        if (item.payment_id) {
            console.log('Processing refund for payment ID:', item.payment_id);
            try {
                refundResult = await processRefund(
                    item.payment_id,
                    item.item_subtotal || (item.item_price * item.item_quantity),
                    item.order_id,
                    item.item_title
                );

                if (!refundResult.success) {
                    console.error('Refund failed:', refundResult.error);
                    return res.status(500).json({
                        message: 'Failed to process refund. Please try again or contact support.',
                        error: refundResult.error
                    });
                }

                console.log('Refund processed successfully:', refundResult);

            } catch (refundError) {
                console.error('Refund processing error:', refundError);
                return res.status(500).json({
                    message: 'Failed to process refund. Please contact support.',
                    error: refundError.message
                });
            }
        }

        // Insert refund record into database BEFORE deleting the item
        if (refundResult && refundResult.success) {
            const insertRefundSQL = `
                INSERT INTO refunds 
                (order_id, payment_id, refund_id, item_id, item_title, refund_amount, 
                refund_status, customer_email, customer_name, refund_reason, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            data.query(insertRefundSQL, [
                item.order_id,
                item.payment_id,
                refundResult.refund_id,
                item.item_id,
                item.item_title,
                refundResult.amount,
                refundResult.status,
                item.customer_email,
                item.customer_name,
                'Order cancellation'
            ], (refundInsertErr) => {
                if (refundInsertErr) {
                    console.error('Error saving refund record:', refundInsertErr);
                    return res.status(500).json({ message: 'Error saving refund record' });
                } else {
                    console.log('Refund record saved successfully');
                }
            });
        }

        // Now delete the item from order_items table
        const deleteSQL = 'DELETE FROM order_items WHERE id = ? AND customer_email = ?';
        data.query(deleteSQL, [parseInt(itemId), userEmail], (deleteErr, deleteResult) => {
            if (deleteErr) {
                console.error('Error deleting order item:', deleteErr);
                return res.status(500).json({ message: 'Error deleting order item' });
            }

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'No item was deleted. Item may not exist or you may not have permission.' 
                });
            }

            console.log(`Successfully deleted ${deleteResult.affectedRows} item(s) from order_items`);

            // Send confirmation email
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: userEmail,
                cc: process.env.EMAIL_FROM,
                subject: `Order Item Cancellation Confirmation - ${item.order_id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #dc3545;">Order Item Cancelled</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Order ID:</strong> ${item.order_id}</p>
                            <p><strong>Item:</strong> ${item.item_title}</p>
                            <p><strong>Quantity:</strong> ${item.item_quantity}</p>
                            <p><strong>Price:</strong> ₹${item.item_price}</p>
                            <p><strong>Subtotal:</strong> ₹${item.item_subtotal || (item.item_price * item.item_quantity)}</p>
                            <p><strong>Cancelled on:</strong> ${new Date().toLocaleString('en-IN')}</p>
                        </div>
                        ${refundResult ? `
                            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #155724;">Refund Details</h3>
                                <p><strong>Refund ID:</strong> ${refundResult.refund_id}</p>
                                <p><strong>Refund Amount:</strong> ₹${refundResult.amount}</p>
                                <p><strong>Refund Status:</strong> ${refundResult.status}</p>
                                <p>Refund will be processed within 5-7 business days.</p>
                            </div>
                        ` : ''}
                        <p style="color: #6c757d;">
                            If you have any questions, please contact our support team.
                        </p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) {
                    console.error('Error sending cancellation email:', mailErr);
                }
            });

            // Return success response
            res.json({ 
                message: 'Item canceled successfully and email sent',
                deleted: true,
                affectedRows: deleteResult.affectedRows,
                refund: refundResult ? {
                    refund_id: refundResult.refund_id,
                    amount: refundResult.amount,
                    status: refundResult.status
                } : null
            });
        });
    });
});

app.get('/refund-status/:refundId', verifyToken, async (req, res) => {
    const refundId = req.params.refundId;
    const userEmail = req.user.email;

    try {
        const refund = await razorpay.refunds.fetch(refundId);

        const updateStatusSQL = 'UPDATE refunds SET refund_status = ? WHERE refund_id = ? AND customer_email = ?';
        data.query(updateStatusSQL, [refund.status, refundId, userEmail], (err) => {
            if (err) {
                console.error('Error updating refund status:', err);
            }
        });

        res.json({
            refund_id: refund.id,
            status: refund.status,
            amount: refund.amount / 100,
            created_at: new Date(refund.created_at * 1000),
            notes: refund.notes
        });

    } catch (error) {
        console.error('Error fetching refund status:', error);
        res.status(500).json({ message: 'Error fetching refund status' });
    }
});

app.get('/user-refunds', verifyToken, (req, res) => {
    const userEmail = req.user.email;

    console.log('Fetching refunds for email:', userEmail);

    const sql = 'SELECT * FROM refunds WHERE customer_email = ? ORDER BY created_at DESC';
    data.query(sql, [userEmail], (err, results) => {
        if (err) {
            console.error('Error fetching refunds:', err);
            return res.status(500).json({ message: 'Error fetching refunds' });
        }

        console.log(`Found ${results.length} refunds for ${userEmail}`);
        res.json(results || []);
    });
});

app.post("/reviews", verifyToken, (req, res) => {
    const { orderId, itemId, rating, review } = req.body;
    const email = req.user.email;

    console.log('Received review request:', { orderId, itemId, rating, review, email });

    if (!orderId || !itemId || !rating) {
        console.log('Missing required fields');
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
        console.log('Invalid rating value:', rating);
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const checkQuery = `
        SELECT oi.created_at 
        FROM order_items oi
        WHERE oi.order_id = ? AND oi.id = ? AND oi.customer_email = ?`;

    data.query(checkQuery, [orderId, itemId, email], (err, results) => {
        if (err) {
            console.error('Error checking order:', err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            console.log('Order not found for:', { orderId, itemId, email });
            return res.status(400).json({ message: "Order not found or unauthorized" });
        }

        const insertQuery = `
            INSERT INTO product_reviews (order_id, item_id, customer_email, rating, review, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                rating = VALUES(rating),
                review = VALUES(review),
                updated_at = NOW()`;

        data.query(insertQuery, [orderId, itemId, email, rating, review || ''], (err2) => {
            if (err2) {
                console.error('Error saving review:', err2);
                return res.status(500).json({ message: "Error saving review" });
            }
            console.log('Review saved successfully for:', { orderId, itemId, email });
            res.json({ message: "Review submitted successfully" });
        });
    });
});

app.get("/product-ratings", (req, res) => {
    const query = `
        SELECT item_id, AVG(rating) as avgRating, COUNT(*) as count 
        FROM product_reviews 
        GROUP BY item_id`;

    data.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching ratings:', err);
            return res.status(500).json({ message: "Error fetching ratings" });
        }
        res.json(results);
    });
});

app.get("/user-reviews", verifyToken, (req, res) => {
    const query = `
        SELECT order_id, item_id, rating, review 
        FROM product_reviews 
        WHERE customer_email = ?`;

    data.query(query, [req.user.email], (err, results) => {
        if (err) {
            console.error('Error fetching user reviews:', err);
            return res.status(500).json({ message: "Error fetching user reviews" });
        }
        res.json(results);
    });
});

app.listen(PORT, HOST, function () {
    console.log(`Server connected on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});