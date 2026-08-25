import dotenv from "dotenv";
import { sendOTPEmail } from "./services/emailService.js";

dotenv.config();

async function testBrevo() {
  try {
    await sendOTPEmail(
      "sivamaninadavala005@gmail.com",
      "123456"
    );

    console.log("Brevo test completed successfully!");

  } catch (error) {
    console.error("Brevo test failed:");
    console.error(error);
  }
}

testBrevo();