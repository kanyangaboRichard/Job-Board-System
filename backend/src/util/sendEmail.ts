import nodemailer, { Transporter } from "nodemailer";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface SendEmailParams {
  applicant_email: string;
  applicant_name?: string;
  job_title: string;
  status: ApplicationStatus;
  responseNote?: string;
}

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ?? "smtp.example.com",
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail({
  applicant_email,
  applicant_name,
  job_title,
  status,
  responseNote,
}: SendEmailParams): Promise<void> {
  const fromAddress = process.env.EMAIL_USER ?? "no-reply@example.com";
  const ccAddress = process.env.SYSTEM_EMAIL ?? process.env.EMAIL_USER;

  try {
    let emailBody = `
      <p>Hello ${applicant_name ?? "Applicant"},</p>
      <p>Your application for <strong>${job_title}</strong> has been <strong>${status}</strong>.</p>
    `;

    if (status === "rejected" && responseNote) {
      emailBody += `
        <div style="background-color:#ffe6e6; padding:10px; border-radius:8px; margin:10px 0;">
          <p><strong>Reason for rejection:</strong></p>
          <p style="color:#b30000;">${responseNote}</p>
        </div>
      `;
    } else if (responseNote) {
      emailBody += `<p><em>Message from Admin:</em> ${responseNote}</p>`;
    }

    emailBody += `
      <p>Thank you for applying!</p>
      <br/>
      <p>Best regards,<br/>Job Board Team</p>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Job Board System" <${fromAddress}>`,
      to: applicant_email,
      subject: `Your Application for "${job_title}" has been ${status}`,
      html: emailBody,
    };

    if (ccAddress) {
      mailOptions.cc = ccAddress;
    }

    await transporter.sendMail(mailOptions);
    console.log(` Email sent successfully to ${applicant_email}`);
  } catch (error) {
    console.error(" Email sending failed:", error);
    throw new Error("Email sending failed");
  }
}
