import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

/**
 * Create Nodemailer transporter
 * Configure for your email provider
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log('✓ Email configuration verified');
        return true;
    } catch (error) {
        console.error('✗ Email configuration error:', error);
        return false;
    }
}

/**
 * Send plain text email
 */
export async function sendEmailText(
    to: string,
    subject: string,
    text: string
): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            text,
        });

        console.log(`✓ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to send email to ${to}:`, error);
        return false;
    }
}

/**
 * Send HTML email
 */
export async function sendEmailHtml(
    to: string,
    subject: string,
    html: string,
    replyTo?: string
): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            html,
            replyTo: replyTo || EMAIL_FROM,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
            },
        });

        console.log(`✓ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to send email to ${to}:`, error);
        return false;
    }
}

/**
 * Send email with both text and HTML fallback
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    textFallback?: string
): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            html,
            text: textFallback || 'Please view this email in HTML',
        });

        console.log(`✓ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to send email to ${to}:`, error);
        return false;
    }
}

/**
 * Send batch emails (be careful with rate limits)
 */
export async function sendEmailBatch(
    recipients: Array<{ to: string; subject: string; html: string }>,
    delay: number = 1000 // 1 second between emails
): Promise<number> {
    let sent = 0;

    for (const email of recipients) {
        const success = await sendEmail(email.to, email.subject, email.html);
        if (success) sent++;

        // Wait between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.log(`✓ Sent ${sent}/${recipients.length} emails`);
    return sent;
}

/**
 * Send OTP email (convenience function)
 */
export async function sendOTPEmail(
    to: string,
    otp: string,
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_VERIFICATION'
): Promise<boolean> {
    const subjects = {
        EMAIL_VERIFICATION: 'Verify Your Email Address',
        PASSWORD_RESET: 'Reset Your Password',
        LOGIN_VERIFICATION: 'Your Secure Login Code',
    };

    const messages = {
        EMAIL_VERIFICATION: `Your email verification code is: ${otp}`,
        PASSWORD_RESET: `Your password reset code is: ${otp}`,
        LOGIN_VERIFICATION: `Your login verification code is: ${otp}`,
    };

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verification Code</h1>
          </div>
          <div class="content">
            <p>Your verification code is:</p>
            <div class="otp">${otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail(to, subjects[type], html, messages[type]);
}

const mailFunctions = {
    verifyEmailConfig,
    sendEmailText,
    sendEmailHtml,
    sendEmail,
    sendEmailBatch,
    sendOTPEmail,
};
export default mailFunctions