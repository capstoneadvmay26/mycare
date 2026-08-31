// Since feature/auth isn't built yet, this create a user directly in
// the test database abd signs a token the same way requireAuth expects
// Letting Profile/Medication tests run  independently of this branch.

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../src/models/user.model");

async function createTestUserAndToken(email = "test@example.com") {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await User.create({
    fullName: "Test User",
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
}

module.exports = { createTestUserAndToken };
