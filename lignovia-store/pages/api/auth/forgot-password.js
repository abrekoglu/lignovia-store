import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    // Don't reveal if the user exists or not
    if (!user) {
      // Still return success for security (don't reveal if email exists)
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Check if user has a password (not OAuth only)
    if (!user.password) {
      // Still return success for security
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(resetTokenExpiry);
    await user.save();

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, log to console (remove in production and replace with actual email service)
    console.log("=".repeat(50));
    console.log("PASSWORD RESET REQUEST");
    console.log("=".repeat(50));
    console.log("User Email:", email);
    console.log("Reset Token:", resetToken);
    console.log("Reset URL:", resetUrl);
    console.log("Expires:", new Date(resetTokenExpiry).toLocaleString());
    console.log("=".repeat(50));

    // In production, use an email service like SendGrid, Resend, or Nodemailer
    // Example:
    // await sendPasswordResetEmail(email, resetUrl);
    //
    // Email template should include:
    // - Subject: "Reset your LIGNOVIA password"
    // - Body: A link to the reset URL with the token
    // - Expiry notice: "This link expires in 1 hour"

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
}

