import nodemailer from "nodemailer";
import config from "../config/config";
export type emailOptions = {
  email: string;
  subject: string;
  html?: string;
  text?: string;
};
export const sendEmail = (option: emailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 25,
    auth: {
      user: config.mailAccount,
      pass: config.mailAppPassword,
    },
  });
  const mailOptions = {
    from: config.mailAccount,
    to: option.email,
    subject: option.subject,
    html: option.html,
  };
  transporter.sendMail(mailOptions);
};

export const sendTextEmail = (option: emailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 25,
    auth: {
      user: config.mailAccount,
      pass: config.mailAppPassword,
    },
  });

  const mailOptions = {
    from: config.mailAccount,
    to: option.email,
    subject: option.subject,
    text: option.text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};


