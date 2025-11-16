import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/GenerateToken.js";

export const loginOrRegister = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    // If user does NOT exist → auto-register them
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        email,
        password: hashedPassword,
        firstLoginAt: new Date(),
        lastLoginAt: new Date(),
      });
    } else {
      // User exists → validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid password" });

      // Update last login time
      user.lastLoginAt = new Date();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstLoginAt: user.firstLoginAt,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
