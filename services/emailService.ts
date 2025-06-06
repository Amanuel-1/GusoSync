import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendRegistrationEmail(to: string, email: string, password: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Your GusoSync Account Credentials',
    text: `Hello,

Your account for GusoSync has been successfully registered.

You can log in using the following credentials:
Email: ${email}
Password: ${password}

Please log in and consider changing your password after your first login.

Thank you,
The GusoSync Team`,
    html: `<p>Hello,</p>
<p>Your account for GusoSync has been successfully registered.</p>
<p>You can log in using the following credentials:</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Password:</strong> ${password}</p>
<p>Please log in and consider changing your password after your first login.</p>
<p>Thank you,<br>The GusoSync Team</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Registration email sent successfully to', to);
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw new Error('Failed to send registration email.');
  }
}
