import nodemailer from "nodemailer";

// Simple config using built-in email services (Gmail, Outlook, Hotmail, etc.)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export default transporter;
