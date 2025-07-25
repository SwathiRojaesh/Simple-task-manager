// test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env.local' }); // This line loads your .env.local file

async function main() {
  console.log("--- Starting Email Test ---");

  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  console.log(`[INFO] Found Email User: ${user}`);
  
  // This checks if the password was found, but doesn't print the password for security
  if (pass) {
    console.log("[INFO] Found Email Password.");
  } else {
    console.error("[FATAL] FAILED TO FIND EMAIL_SERVER_PASSWORD in .env.local file!");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    console.log("[TEST] Verifying credentials with Google...");
    await transporter.verify();
    console.log("\n✅ ✅ ✅ SUCCESS! Your credentials are correct and Google accepted the login.");
    console.log("This means the problem is inside the Next.js app. The final code I provided will fix this.");

  } catch (error) {
    console.error("\n❌ ❌ ❌ FAILED! Your credentials were REJECTED by Google.");
    console.error("This proves the problem is with the App Password or your Google Account.");
    console.error("Please double-check the 16-character password in your .env.local file.");
    console.error("\nFull Error Details:");
    console.error(error);
  }
}

main();