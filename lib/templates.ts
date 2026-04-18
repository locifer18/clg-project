// lib/templates.ts
/**
 * Email templates for authentication
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * OTP Email Template
 */
export function getOTPTemplate(
  otp: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_VERIFICATION' = 'EMAIL_VERIFICATION',
  appName: string = 'Electronics Store'
): EmailTemplate {
  let subject = 'Verify Your Email';
  let title = 'Email Verification';
  let message =
    'Thank you for registering! Please use the following OTP to verify your email address.';

  if (type === 'PASSWORD_RESET') {
    subject = 'Reset Your Password';
    title = 'Password Reset';
    message =
      'We received a request to reset your password. Please use the following OTP to proceed.';
  } else if (type === 'LOGIN_VERIFICATION') {
    subject = 'Your Login Verification Code';
    title = 'Secure Login Verification';
    message =
      'You are attempting to log in to your account. Please use the following OTP to securely complete your login.';
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            margin-top: 0;
            color: #333;
            font-size: 24px;
          }
          .content p {
            margin: 16px 0;
            color: #666;
            font-size: 16px;
          }
          .otp-box {
            background-color: #f9f9f9;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
          }
          .otp {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 0;
          }
          .otp-expiry {
            font-size: 14px;
            color: #999;
            margin-top: 10px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
            font-size: 14px;
          }
          .footer {
            background-color: #f9f9f9;
            border-top: 1px solid #eee;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .footer p {
            margin: 8px 0;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <div class="logo">${appName}</div>
            </div>
            <div class="content">
              <h2>${title}</h2>
              <p>${message}</p>
              
              <div class="otp-box">
                <p class="otp">${otp}</p>
                <p class="otp-expiry">This code expires in 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> Never share this code with anyone. We will never ask for this code via email or phone.
              </div>

              <p>If you didn't request this ${type === 'EMAIL_VERIFICATION' ? 'verification' : 'code'}, please ignore this email and your account will remain secure.</p>

              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
              <p>
                <a href="https://example.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> |
                <a href="https://example.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
${title}

${message}

Your code: ${otp}

This code expires in 10 minutes.

If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} ${appName}
  `.trim();

  return { subject, html, text };
}

/**
 * Welcome Email Template
 */
export function getWelcomeTemplate(
  userName: string,
  appName: string = 'Electronics Store'
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; }
          .email { background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
          .content { padding: 40px; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email">
            <div class="header">
              <h1>${appName}</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${userName}!</h2>
              <p>Thank you for joining ${appName}. We're excited to have you on board!</p>
              <p>Your account has been successfully created and verified. You can now:</p>
              <ul>
                <li>Browse our product catalog</li>
                <li>Add items to your cart</li>
                <li>Place orders</li>
                <li>Track your purchases</li>
              </ul>
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome, ${userName}!

Thank you for joining ${appName}. Your account has been successfully created.

Enjoy shopping!

© ${new Date().getFullYear()} ${appName}
  `.trim();

  return {
    subject: `Welcome to ${appName}, ${userName}!`,
    html,
    text,
  };
}

/**
 * Password Changed Confirmation
 */
export function getPasswordChangedTemplate(
  appName: string = 'Electronics Store'
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; }
          .email { background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
          .content { padding: 40px; }
          .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email">
            <div class="header">
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <div class="success">
                <p><strong>✓ Your password has been successfully changed.</strong></p>
              </div>
              <p>Your account password was recently changed. If you didn't make this change, please contact us immediately.</p>
              <p>For security purposes:</p>
              <ul>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Update your password if you shared it with anyone</li>
                <li>Log out from all devices and log back in</li>
              </ul>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Password Changed

Your password has been successfully changed. If you didn't make this change, please contact support immediately.

© ${new Date().getFullYear()} ${appName}
  `.trim();

  return {
    subject: 'Password Changed Confirmation',
    html,
    text,
  };
}
const otpFunctions = {
  getOTPTemplate,
  getWelcomeTemplate,
  getPasswordChangedTemplate,
}
export default otpFunctions;