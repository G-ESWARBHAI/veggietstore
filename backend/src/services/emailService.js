const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Get email credentials (support both EMAIL_PASSWORD and EMAIL_PASS for compatibility)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    
    // Validate credentials
    if (!emailUser || !emailPass) {
      console.warn('⚠️  Email credentials not configured. Email functionality will not work.');
      console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return;
    }

    // Create transporter based on environment
    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    } else {
      // Generic SMTP configuration (defaults to Gmail SMTP)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }
  }

  async sendPasswordResetEmail(user, resetUrl, resetToken) {
    // Check if transporter is initialized
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Veggie Store'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request - Veggie Store',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
              .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
              .warning { color: #ff9800; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: white; margin: 0;">🌱 Veggie Store</h1>
                <p style="color: #e8f5e9; margin: 10px 0 0 0;">Password Reset Request</p>
              </div>
              <div class="content">
                <h2 style="color: #4CAF50;">Hello ${user.name},</h2>
                <p>You requested to reset your password for your Veggie Store account.</p>
                
                <div class="info-box">
                  <p style="margin: 0;"><strong>Click the button below to reset your password:</strong></p>
                </div>

                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4CAF50;">${resetUrl}</p>

                <div class="info-box">
                  <p class="warning" style="margin: 0;">⚠️ This link will expire in 15 minutes.</p>
                  <p style="margin: 10px 0 0 0;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
                </div>

                <p style="margin-top: 30px;">Best regards,<br>
                <strong>The Veggie Store Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Veggie Store. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${user.name},
          
          You requested to reset your password for your Veggie Store account.
          
          Click the link below to reset your password:
          ${resetUrl}
          
          This link will expire in 15 minutes.
          
          If you did not request this password reset, please ignore this email.
          
          Best regards,
          The Veggie Store Team
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

