// smsService.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

async function sendSMS(to, message) {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (err) {
    console.error('Failed to send SMS:', err);
  }
}

module.exports = { sendSMS };
