const {
  okResponse,
  badRequestError,
  to,
  unverifiedError,
  loginResponse,
} = require("../../global_functions");
const User = require("../../models/user/userModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../../mail/mailer");
const { JWT_SECRET } = require("../../../config/JwtConfig");
const speakeasy = require("speakeasy");


//User SignUp
const SignUp = async (req,res)=>{
  let data  = req.body;
       console.log(data)
      
      let user_added = await User.query().skipUndefined().insert(data).returning("*");
        if(!user_added) return res.send("User not Created");
  
      return res.send("User registered successfully");
  };

//verifies signup  OTP 

const VerifyUser = async (req, res) => {
  let { token, email } = req.body;
  let token_validates = speakeasy.totp.verify({
    secret: JWT_SECRET + email,
    encoding: "base32",
    token: token,
    window: 6,
  });
  //if  OTP is Matched
  if (token_validates === true) {
    let [error, verified] = await to(
      User.query()
        .update({ isEmailVerified: true })
        .where("email", email)
        .andWhere("token", token)
        .returning("*")
        .throwIfNotFound()
    );

    console.log("TOKEN .. :- ", verified);
    if (error) {
      console.log(error);
      return unverifiedError(res, "Wrong OTP");
    }
    if (verified) {
      let access_token = jwt.sign({ email: verified.email,
                                    userId:verified.id ,
                                    userName:verified.userName }, JWT_SECRET, {
        expiresIn: "5h",
      });
     delete verified.password;

      res.setHeader("Authorization", access_token);
      res.setHeader("access-control-expose-headers", "authorization");
      return okResponse(res, verified, "email verified");
    }
  } else return badRequestError(res, "wrong OTP");
};

//Login User

const Login = async (req, res) => {
  let { email, password } = req.body;
  if (!validator.isEmail(email || ""))
    return badRequestError(res, "Enter a valid email address ");
  if (password === "") return unverifiedError(res, "password field is empty");
  let [incorrect, user_returned] = await to(
    User.query().findOne("email", email).throwIfNotFound()
  );

  if (incorrect) return badRequestError(res, "email does not exists");

  //Checking whether email is verified
  if (user_returned.isEmailVerified === true) {
    if (await bcrypt.compare(password, user_returned.password)) {
      let access_token = await jwt.sign({ email,userId:user_returned.id,userName:user_returned.userName }, JWT_SECRET, {
        expiresIn: "2h",
      });
      res.setHeader("Authorization", access_token);
      res.setHeader("access-control-expose-headers", "authorization");

      delete user_returned.password;
      return loginResponse(res, user_returned, true, "logged in successfully");
    }
    return unverifiedError(res, "invalid password");
  }

  //if email id is not verified

  if (user_returned.isEmailVerified === false) {
    if (await bcrypt.compare(password, user_returned.password)) {
      //generating OTP to send on registered email
      let token = speakeasy.totp({
        secret: JWT_SECRET + email,
        encoding: "base32",
      });
      sendMail(email, `otp ${token}`); //sending token on registered email id

      let [error, updated] = await to(
        User.query()
          .where("email", email)
          .update({ token: token })
          .returning("email")
          .throwIfNotFound()
      );
      if (updated)
        return loginResponse(res, null, false, "token sent to your email");
      else return console.log(error);
    }
    return unverifiedError(res, "invalid password");
  }
};

//forgot password recovery

const ForgotPassword = async (req, res) => {
  let { email } = req.body;

  if (!validator.isEmail(email || ""))
    return badRequestError(res, "Enter a valid email address ");

  let [not_found, user_returned] = await to(
    User.query().findOne("email", email).throwIfNotFound()
  );
  if (not_found) return badRequestError(res, "email id not registered");

  let verification_token = await jwt.sign({ email: email }, JWT_SECRET, {
    expiresIn: "600s",
  });

  let verification_link =
    "http://localhost:3000/reset-password/verifyresetlink?verification_link=" +
    verification_token;

  sendMail(email, `verfication link ${verification_link}`);
  return okResponse(res, null, "verification link is sent to your email ");
};

//Reset link for new password

const ResetLink = (req, res) => {
  verification_link = req.query.verification_link;
  if (!verification_link) return badRequestError(res, "empty link");
  jwt.verify(verification_link, JWT_SECRET, (error, result) => {
    if (error) return badRequestError(res, "not verified");
    else {
      let reset_token = jwt.sign({ email: result.email }, JWT_SECRET, {
        expiresIn: "300s",
      });
      return okResponse(res, reset_token, "verified");
    }
  });
};

//reset password
const ResetPassword = async (req, res) => {
  let { reset_token, password } = req.body;
  jwt.verify(reset_token, JWT_SECRET, async (notverified, verified) => {
    if (notverified) return badRequestError(res, "password not changed");
    if (verified) {
      let email = verified.email;
      let hashed_password = await bcrypt.hash(password, 10);
      let [error, user_updated] = await to(
        User.query()
          .findOne("email", email)
          .update({ password: hashed_password })
          .throwIfNotFound()
      );
      if (error) return badRequestError(res, "unable to insert password");

      delete user_updated.password;
      let access_token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "2h" });
      res.setHeader("Authorization", access_token);
      res.setHeader("access-control-expose-headers", "authorization");

      return okResponse(res, user_updated, "password changed successfully");
    }
  });
};
// Change user password
const ChangePassword = async (req, res) => {
  let { email, new_password, old_password } = req.body;
  if (!email) return badRequestError(res, "email field is empty");
  if (!new_password || !old_password)
    return badRequestError(res, "password field is empty");

  let [error, user_detail] = await to(
    User.query().findOne("email", email).returning("password").throwIfNotFound()
  );
  if (user_detail) {
    console.log("user_detail ki value", user_detail.password);
    if (await bcrypt.compare(old_password, user_detail.password)) {
      let new_hashed_password = await bcrypt.hash(new_password, 10);
      let [err, password_updated] = await to(
        User.query()
          .where("email", email)
          .update({ password: new_hashed_password })
          .throwIfNotFound()
      );
      if (password_updated)
        return okResponse(res, undefined, "password changed successfully");
    } else {
      return badRequestError(res, "old password did not match");
    }
  }
};

//ignore only for testing

const Delete = async (req, res) => {
  let [error, deleted] = await to(User.query().delete());
  if (error) badRequestError(res, "unable to delete");
  okResponse(res, deleted, "delete successfull");
};
// Export Controllers
module.exports = {
  SignUp,
  Delete,
  VerifyUser,
  Login,
  ForgotPassword,
  ResetLink,
  ResetPassword,
  ChangePassword,
};
