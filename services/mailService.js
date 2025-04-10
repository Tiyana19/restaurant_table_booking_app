// mailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'example@gmail.com',
    pass: '1234567', 
  },
});

const sendConfirmationEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'example@gmail.com',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendConfirmationEmail };
