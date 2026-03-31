import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service - Sends emails using Nodemailer
 * Supports Gmail via App Password
 */

let transporter = null;
let emailConfigured = false;

// Initialize email transporter
function initTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
        console.warn('⚠️  Email not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD in backend/.env');
        console.warn('📧 OTP codes will only be logged to console until email is configured.');
        return false;
    }

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        emailConfigured = true;
        console.log(`✅ Email service configured (${emailUser})`);
        return true;
    } catch (error) {
        console.error('❌ Failed to configure email:', error.message);
        return false;
    }
}

// Initialize on import
initTransporter();

/**
 * Send OTP verification email
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<boolean>} - Whether email was sent
 */
export async function sendOtpEmail(toEmail, otpCode) {
    // Always log to console as backup
    console.log('');
    console.log('\x1b[36m╔═══════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║\x1b[0m  \x1b[33m🔐 2FA VERIFICATION CODE\x1b[0m                       \x1b[36m║\x1b[0m');
    console.log('\x1b[36m╠═══════════════════════════════════════════════╣\x1b[0m');
    console.log(`\x1b[36m║\x1b[0m  Email: \x1b[37m${toEmail}\x1b[0m`);
    console.log(`\x1b[36m║\x1b[0m  Code:  \x1b[32m\x1b[1m${otpCode}\x1b[0m`);
    console.log('\x1b[36m╚═══════════════════════════════════════════════╝\x1b[0m');
    console.log('');

    if (!emailConfigured || !transporter) {
        console.warn('📧 Email not sent (not configured). Code logged above.');
        return false;
    }

    try {
        const mailOptions = {
            from: `"CODECASH Security" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '🔐 CODECASH - Your Verification Code',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #111111; border-radius: 16px; border: 1px solid #222222; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px;">
                                CODE<span style="color: #fecaca;">CASH</span>
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
                                Secure M-Pesa & Deriv Transactions
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Shield Icon -->
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; width: 60px; height: 60px; background: rgba(220, 38, 38, 0.15); border-radius: 50%; line-height: 60px; font-size: 28px;">
                                    🔐
                                </div>
                            </div>
                            
                            <h2 style="color: #ffffff; text-align: center; margin: 0 0 8px; font-size: 22px;">
                                2-Step Verification
                            </h2>
                            <p style="color: #888888; text-align: center; margin: 0 0 30px; font-size: 14px;">
                                Use this code to complete your sign-in
                            </p>
                            
                            <!-- OTP Code Box -->
                            <div style="background: #1a1a1a; border: 2px solid #dc2626; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                                    Your verification code
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                    ${otpCode}
                                </p>
                            </div>
                            
                            <!-- Expiry Warning -->
                            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                                <p style="margin: 0; color: #eab308; font-size: 13px; text-align: center;">
                                    ⏰ This code expires in <strong>5 minutes</strong>
                                </p>
                            </div>
                            
                            <!-- Security Note -->
                            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
                                If you didn't request this code, please ignore this email. 
                                Never share this code with anyone.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid #222222; text-align: center;">
                            <p style="margin: 0; color: #444444; font-size: 11px;">
                                © ${new Date().getFullYear()} CODECASH. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
        return false;
    }
}

export default { sendOtpEmail };
