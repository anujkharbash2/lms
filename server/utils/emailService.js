const nodemailer = require('nodemailer');
const path = require('path');

// FORCE load the .env file from the server root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendCredentialEmail = async (toEmail, name, userId, password) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            throw new Error("Missing EMAIL_USER or EMAIL_APP_PASSWORD in .env file");
        }

        const mailOptions = {
            from: `"LMS Admin" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Welcome to LMS - Your Login Credentials',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        /* Base Styles */
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        
                        /* Card Container */
                        .container { 
                            max-width: 600px; 
                            margin: 30px auto; 
                            background-color: #ffffff; 
                            border-radius: 8px; 
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
                            overflow: hidden; 
                            border: 1px solid #e0e0e0;
                        }

                        /* Header */
                        .header { 
                            background-color: #2c3e50; 
                            color: #ffffff; 
                            padding: 25px; 
                            text-align: center; 
                        }
                        
                        /* Main Content */
                        .content { 
                            padding: 30px; 
                            color: #333333; 
                            line-height: 1.6; 
                            font-size: 16px;
                        }

                        /* Credential Box (The Blue Highlight) */
                        .credentials-box { 
                            background-color: #f0f7fb; 
                            border-left: 5px solid #3498db; 
                            padding: 20px; 
                            margin: 25px 0; 
                            border-radius: 4px; 
                        }
                        .credential-item { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 100px;}
                        .value { font-family: 'Consolas', 'Courier New', monospace; color: #2980b9; font-weight: bold; font-size: 18px; }

                        /* Warning/Beta Box (The Yellow Highlight) */
                        .beta-notice { 
                            background-color: #fff8e1; 
                            color: #856404; 
                            padding: 15px; 
                            border-radius: 4px; 
                            border: 1px solid #ffeeba; 
                            margin-top: 25px; 
                            font-size: 14px; 
                        }

                        /* Footer */
                        .footer { 
                            background-color: #f8f9fa; 
                            padding: 20px; 
                            text-align: center; 
                            font-size: 12px; 
                            color: #95a5a6; 
                            border-top: 1px solid #eeeeee;
                        }
                        .link { color: #3498db; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin:0; font-size: 24px;">Welcome to the LMS</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${name}</strong>,</p>
                            <p>Your account has been successfully created. We are excited to have you on board!</p>
                            
                            <p>Here are your temporary login details:</p>
                            
                            <div class="credentials-box">
                                <div class="credential-item">
                                    <span class="label">User ID:</span> 
                                    <span class="value">${userId}</span>
                                </div>
                                <div class="credential-item">
                                    <span class="label">Password:</span> 
                                    <span class="value">${password}</span>
                                </div>
                            </div>

                            <p>Please login to access the portal.</p>

                            <!-- Beta Testing Notice -->
                            <div class="beta-notice">
                                <strong>🚧 Portal Under Testing</strong><br>
                                We are currently testing the portal, so some features (such as password updates) may not be available yet.
                                <br><br>
                                <strong>Found a bug?</strong><br>
                                In case you find any error, please reply to this email or send a report to <a href="mailto:btechcsesau2829@gmail.com" class="link">btechcsesau2829@gmail.com</a>.
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply directly unless reporting an issue.</p>
                            <p>&copy; ${new Date().getFullYear()} LMS Portal. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email actually sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email Service Error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendCredentialEmail };