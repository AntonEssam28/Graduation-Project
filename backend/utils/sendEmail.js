const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use user's env vars if available, otherwise use a generic fallback or just log
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || 'dummy@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'dummy_pass',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Street2Home'} <${process.env.FROM_EMAIL || 'noreply@street2home.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    if (!process.env.SMTP_PASSWORD) {
      console.log('----------------------------------------------------');
      console.log(`[SIMULATED EMAIL to ${options.email}]:\n${options.message}`);
      console.log('----------------------------------------------------');
      console.log('Please configure SMTP_EMAIL and SMTP_PASSWORD in .env');
      return;
    }
    await transporter.sendMail(message);
  } catch (error) {
    console.error('Email send failed:', error);
  }
};

module.exports = sendEmail;
