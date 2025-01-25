import express from "express";
import User from "../model/User.js";
import bcrypt from "bcrypt";
// import Joi from "joi";
import jwt from "jsonwebtoken";
import "dotenv/config";
import sendResponse from "../helpers/sendResponse.js";
const router = express.Router();
import nodemailer from "nodemailer";
const secretCode = process.env.Secret_code;
const pass = process.env.EMAIL_PASS;
const em = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: em,
        pass: pass,

    },
});


// const registerSchema = Joi.object({
//   email: Joi.string().email({
//     minDomainSegments: 2,
//     tlds: { allow: ["com", "net"] },
//   }),
//   password: Joi.string().min(6).required(),
//   fullname: Joi.string().min(3).max(30).required(),
// });

// const loginSchema = Joi.object({
//   email: Joi.string().email({
//     minDomainSegments: 2,
//     tlds: { allow: ["com", "net"] },
//   }),
//   password: Joi.string().min(6).required(),
// });

router.post("/signup", async (req, res) => {
  // const { error, value } = registerSchema.validate(req.body);
    const { name, email, Password } = req.body; 
    console.log(req.body);
    
    
  // if (error) return sendResponse(res, 400, null, true, error.message);
  const user = await User.findOne({ email: email });
  if (user)
    return sendResponse(
      res,
      403,
      null,
      true,
      "User with this email already registered."
    );

    const hashedPassword = await bcrypt.hash(Password, 12);
   const  password = hashedPassword;

  let newUser = new User({name , email , password });
    newUser = await newUser.save();
    const jwtToken = jwt.sign({ email: newUser.email, id: newUser._id }, secretCode, { expiresIn: "24h" });
    res.cookie("token", jwtToken);
    const verifyUrl = `http://localhost:4000/auth/verify?token=${jwtToken}`;
    const mailOptions = await transporter.sendMail({
        from: em,
        to: email,
        subject: "Verify your account",

        html: `
        <html>
            <body>
                <h1>Account Verification</h1>
                <p>Click the link below to verify your account:</p>
                <a href="${verifyUrl}" target="_blank" style="color: #1a73e8;">Verify Account</a>
            </body>
        </html>`,
    });
    console.log("email sent");
    


  sendResponse(res, 201, newUser, false, "User Registered Successfully");
});

router.post("/login", async (req, res) => {
  // const { error, value } = loginSchema.validate(req.body);
  // if (error) return sendResponse(res, 400, null, true, error.message);
  const { email, password } = req.body;
  const user = await User.findOne({ email: email }).lean();
  if (!user)
    return sendResponse(res, 403, null, true, "User is not registered.");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return sendResponse(res, 403, null, true, "Invalid Credentials.");

    var token = jwt.sign(user, process.env.SECRET);
    res.cookie("token" , token)

  sendResponse(res, 200, { user, token }, false, "User Login Successfully");
});
export default router;

router.post("/password-reset", async (req, res) => {
  try {
      const { email ,  newPassword } = req.body;

      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Invalid or expired token." });
  }
});

// router.post("/forger-password", (req, res) => {}); 
router.post("/password-reset-request", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse(res , 404 ,null , true , "User not found."  );
        }

        const resetToken = jwt.sign({ email: user.email, id: user._id }, secretCode, { expiresIn: "1h" });
        const resetUrl = `http://localhost:3000/password-reset?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `<h1>Password Reset</h1>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetUrl}">Reset Password</a>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/verify", async (req, res) => {

        const { token } = req.query;
        console.log(req.query);
        
        const verification = jwt.verify(token, secretCode);

        const user = await User.findOne({ email: verification.email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.isVerified = true; 
        await user.save();

        res.status(200).json({ message: "Account verified successfully." });
  
});
