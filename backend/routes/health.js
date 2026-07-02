const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    return res.json({ ok: true, timestamp: Date.now() });
  } catch (err) {
    console.error("Health check error:", err);
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;
