const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the email options
  const mailOptions = {
    from: '"FlowBuddy" <noreply@flowbuddy.app>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Actually send the email
  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
