import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/GenerateToken.js"; 


//REGISTER USER //
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing email
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Save refresh token
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Response
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//LOGIN USER//
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    // Create tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//REFRESH TOKEN//
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token missing" });

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if token matches stored token
    if (user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Refresh token mismatch" });

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);

  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

//LOGOUT USER //
export const logoutUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Clear their refresh token
    user.refreshToken = null;
    await user.save();

    res.json({ message: "Logout successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
