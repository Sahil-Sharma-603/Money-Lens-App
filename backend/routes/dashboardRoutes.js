const express = require("express");
const auth = require("../middleware/auth.middleware");
const { getDashboardData } = require("../logic/dashboardLogic");

const router = express.Router();

router.get("/dashboard", auth, async (req, res) => {
  console.log("GETTING DASHBOARD DATA");
  try {
    const authToken = req.headers.authorization;
    const dashboardData = await getDashboardData(req.user._id, authToken);

    if (dashboardData.error) {
      return res.status(404).json({ error: dashboardData.error });
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard route error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
