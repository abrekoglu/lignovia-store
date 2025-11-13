import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { token } = req.query;

    // Validate input
    if (!token) {
      return res.status(400).json({
        valid: false,
        error: "Reset token is required",
      });
    }

    // Find user with matching reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return res.status(200).json({
        valid: false,
        error: "Invalid or expired reset token",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Reset token is valid",
    });
  } catch (error) {
    console.error("Error validating reset token:", error);
    return res.status(500).json({
      valid: false,
      error: "Internal server error. Please try again later.",
    });
  }
}


