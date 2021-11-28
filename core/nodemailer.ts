import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
   host: process.env.NODEMAILER_HOST || "smtp.mailtrap.io",
   port: Number(process.env.NODEMAILER_PORT) || 2525,
   auth: {
      user: process.env.NODEMAILER_USER || "e23e411235fe00",
      pass: process.env.NODEMAILER_PASS || "13335ab11cd0f7"
   }
});

export default transport;