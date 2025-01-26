import express from "express";

const router = express.Router();
router.get("/profile", async (req, res) => {
  try {
    // Validate that req.user exists
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ status: "fail", message: "Unauthorized access" });
    }

    // Fetch user from the database using req.user.id
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    // Send success response with user data
    res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

export default router;
