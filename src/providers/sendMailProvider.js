import { env } from '../config/environment';

const nodemailer = require('nodemailer');

const sendMail = async (emails, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    }
  });

  const recipients = Array.isArray(emails) ? emails.join(',') : emails;

  // Configure the mailOptions object
  const mailOptions = {
    from: env.EMAIL_USER,
    to: recipients, 
    subject: subject,
    html: text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error:', error);
      return error;
    } else {
      console.log('Email sent:', info.response);
      return info.response;
    }
  });
}

export default sendMail;
