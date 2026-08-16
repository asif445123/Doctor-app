// Run once: npm run seed:admin
// Creates (or promotes) the first admin account so you can log in and approve others.
require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    phone: String,
    password: String,
    role: { type: String, default: "staff" },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const ADMIN_NAME = "Admin";
const ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin@12345";

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    user.role = "admin";
    user.status = "approved";
    user.password = hashed; // always reset to a known password, even if one already existed
    await user.save();
    console.log("Existing user promoted to admin, password reset:", ADMIN_EMAIL, "password:", ADMIN_PASSWORD);
  } else {
    user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
      status: "approved",
    });
    console.log("Admin created:", ADMIN_EMAIL, "password:", ADMIN_PASSWORD);
  }

  await mongoose.disconnect();
  process.exit(0);
})();
