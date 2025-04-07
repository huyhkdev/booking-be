
import config from "../config/config";
import { HttpStatusCode } from "../constants";
import { ResponseCustom } from "../interfaces/express";
import Jwt from "../utils/Jwt";
import { sendEmail } from "../utils/mail";
import generateVerifyForm from "./generateVerifyForm";

const getSendMaiInfo = (
  purpose: string,
  email: string,
  clientLink?: string
) => {
  const params = encodeURIComponent(Jwt.generateVerifyEmailToken(email));
  switch (purpose) {
    case "verify": {
      const verifyLink = `${config.apiUrl}/api/v1/user/verify/${params}`;
      return { verifyLink, action: "Verify Email" };
    }
    case "resetPassword": {
      const verifyLink = `${clientLink}/${params}`;
      return { verifyLink, action: "Reset password" };
    }
    default:
      return {};
  }
};

const sendVerifyLink = (
  response: ResponseCustom,
  email: string,
  purpose: "verify" | "resetPassword",
  clientLink?: string
) => {
  const { verifyLink, action } = getSendMaiInfo(purpose, email, clientLink);
  sendEmail({
    email,
    subject: action as string,
    html: generateVerifyForm(action as string, verifyLink as string),
  });
  return response.status(HttpStatusCode.OK).json({
    httpStatusCode: HttpStatusCode.OK,
  });
};
export default sendVerifyLink;
