import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

export async function sendOTPEmail(email, otp) {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL
      },

      to: [
        {
          email: email
        }
      ],

      subject: "College Voting System - OTP Verification",

      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          
          <h2>College Voting System</h2>

          <p>Your OTP for verification is:</p>

          <h1 style="letter-spacing: 5px;">
            ${otp}
          </h1>

          <p>This OTP will expire in 5 minutes.</p>

          <p>
            If you did not request this OTP, please ignore this email.
          </p>

        </div>
      `
    });

    console.log("OTP email sent successfully");
    console.log("Message ID:", result.messageId);

    return result;

  } catch (error) {
    console.error("Brevo email error:", error);

    throw new Error("Failed to send OTP email");
  }
}


export async function sendTemporaryPasswordEmail(
  email,
  name,
  temporaryPassword
) {
  try {
    const result =
      await brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL
        },

        to: [
          {
            email: email,
            name: name
          }
        ],

        subject: "College Voting System - Account Created",

        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">

            <h2>College Voting System</h2>

            <p>Hello ${name},</p>

            <p>Your account has been created successfully.</p>

            <p>
              <strong>Email:</strong> ${email}
            </p>

            <p>
              <strong>Temporary Password:</strong>
              ${temporaryPassword}
            </p>

            <p>
              Please use these credentials for your first login.
            </p>

            <p>
              You will be required to change your password
              after your first login.
            </p>

            <p>
              Please do not share your credentials with anyone.
            </p>

          </div>
        `
      });

    console.log("Account email sent:", result.messageId);

    return result;

  } catch (error) {
    console.error("Brevo account email error:", error);

    throw new Error("Failed to send account credentials");
  }
}