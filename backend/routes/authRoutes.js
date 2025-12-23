import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, poolPromise } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Full name logic for backward compatibility or display
        const fullName = `${firstName} ${lastName}`.trim();

        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ success: false, message: 'Database disconnected' });

        await pool.request()
            .input('FirstName', sql.NVarChar, firstName)
            .input('LastName', sql.NVarChar, lastName)
            .input('Name', sql.NVarChar, fullName) // Keeping Name for compatibility if needed
            .input('Email', sql.NVarChar, email)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('Phone', sql.NVarChar, phone)
            .query(`
                INSERT INTO Users (FirstName, LastName, Name, Email, PasswordHash, Phone) 
                VALUES (@FirstName, @LastName, @Name, @Email, @PasswordHash, @Phone)
            `);

        res.status(201).json({ success: true, message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ success: false, message: 'Database disconnected' });
        }

        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @Email');

        const user = result.recordset[0];

        if (!user || !(await bcrypt.compare(password, user.PasswordHash))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.Id, email: user.Email }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.Id,
                name: user.Name, // Keep sending Name for existing frontend usage
                firstName: user.FirstName, // Send new fields
                lastName: user.LastName,
                email: user.Email,
                phone: user.Phone,
                avatar: user.AvatarUrl
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Update Profile
router.post('/update', async (req, res) => {
    try {
        const { id, avatar } = req.body;
        // In a real app, verify token here first
        const pool = await poolPromise;
        if (!pool) return res.json({ success: true, message: 'Profile updated (local only)' });

        await pool.request()
            .input('Id', sql.Int, id)
            .input('AvatarUrl', sql.NVarChar, avatar)
            .query('UPDATE Users SET AvatarUrl = @AvatarUrl WHERE Id = @Id');

        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// Change Password
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ success: false, message: 'Database disconnected' });

        // Get user
        const result = await pool.request()
            .input('Id', sql.Int, userId)
            .query('SELECT * FROM Users WHERE Id = @Id');

        const user = result.recordset[0];
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.request()
            .input('Id', sql.Int, userId)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .query('UPDATE Users SET PasswordHash = @PasswordHash WHERE Id = @Id');

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});

// Forgot Password - Request Token
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ success: false, message: 'Database disconnected' });

        // Check if user exists
        const userRes = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT Id, Name FROM Users WHERE Email = @Email');

        if (userRes.recordset.length === 0) {
            // Return success even if email not found to prevent enumeration
            return res.json({ success: true, message: 'If this email exists, a reset token has been sent.' });
        }

        // Generate Token (6 digit random)
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Store Token
        await pool.request()
            .input('Email', sql.NVarChar, email)
            .input('Token', sql.NVarChar, token)
            .input('ExpiresAt', sql.DateTime, expiresAt)
            .query('INSERT INTO PasswordResets (Email, Token, ExpiresAt) VALUES (@Email, @Token, @ExpiresAt)');

        // Log Token (Simulation)
        console.log(`🔑 PASSWORD RESET TOKEN for ${email}: ${token}`);

        res.json({ success: true, message: 'Reset token sent to email.', debug_token: token });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Request failed' });
    }
});

// Reset Password - Verify & Update
router.post('/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ success: false, message: 'Database disconnected' });

        // Verify Token
        const tokenRes = await pool.request()
            .input('Email', sql.NVarChar, email)
            .input('Token', sql.NVarChar, token)
            .query(`SELECT TOP 1 * FROM PasswordResets 
                    WHERE Email = @Email AND Token = @Token 
                    AND ExpiresAt > GETDATE()
                    ORDER BY CreatedAt DESC`);

        if (tokenRes.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update User Password
        await pool.request()
            .input('Email', sql.NVarChar, email)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .query('UPDATE Users SET PasswordHash = @PasswordHash WHERE Email = @Email');

        // Delete used tokens for this email
        await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('DELETE FROM PasswordResets WHERE Email = @Email');

        res.json({ success: true, message: 'Password reset successful. Please login.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Reset failed' });
    }
});

export default router;
