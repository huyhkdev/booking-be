import nodemailer from "nodemailer";
import config from "../config/config";
export type emailOptions = {
  email: string;
  subject: string;
  html: string;
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



