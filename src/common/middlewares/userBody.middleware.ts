import { checkSchema } from "express-validator";

const registerMiddleware = checkSchema({
  fullName: {
    notEmpty: {
      errorMessage: { msg: "Full name is required" },
    },
  },
  email: {
    isEmail: {
      errorMessage: { msg: "Please enter an email address" },
    },
    notEmpty: {
      errorMessage: { msg: "Email is required" },
    },
  },
  password: {
    isString: true,
    notEmpty: {
      errorMessage: { msg: "Password is required" },
    },
  },

});

const loginMiddleware = checkSchema({
  email: {
    isEmail: {
      errorMessage: { msg: "Please enter an email address" },
    },
  },
  password: {
    notEmpty: {
      errorMessage: { msg: "Password is required" },
    },
  },
});

const resetPasswordMiddleware = checkSchema({
  resetToken: {
    notEmpty: {
      errorMessage: { msg: "Invalid verification" },
    },
  },
  newPassword: {
    notEmpty: {
      errorMessage: { msg: "Password is required" },
    },
  },
});

const forgotPasswordMiddleWare = checkSchema({
  email: {
    notEmpty: {
      errorMessage: { msg: "Email is required" },
    },
  }
});

export {
  registerMiddleware,
  loginMiddleware,
  resetPasswordMiddleware,
  forgotPasswordMiddleWare,
};
