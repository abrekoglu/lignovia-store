import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({
        error: "Token and password are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Find user with matching reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been successfully updated",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
}

