import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
   host: process.env.NODEMAILER_HOST as string,
   port: Number(process.env.NODEMAILER_PORT),
   auth: {
      user: process.env.NODEMAILER_USER as string,
      pass: process.env.NODEMAILER_PASS as string
   }
});

export default transport;