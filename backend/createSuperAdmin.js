import bcrypt from "bcryptjs";
import pool from "./config/db.js";

async function createSuperAdmin() {
  try {
    const email = "superadmin@college.com";
    const password = "Admin@123";
    const role = "SUPER_ADMIN";

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES (?, ?, ?)`,
      [email, passwordHash, role]
    );

    console.log("Super Admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Result:", result);

    process.exit(0);

  } catch (error) {
    console.error("Error creating Super Admin:");
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();