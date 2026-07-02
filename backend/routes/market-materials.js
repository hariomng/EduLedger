const express = require("express");
const { getDb } = require("../lib/mongodb.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "12")));

    const query = { visibility: "public" };
    const total = await db.collection("materials").countDocuments(query);
    const items = await db
      .collection("materials")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const normalized = items.map((doc) => ({
      ...doc,
      userAddress: doc.userAddress ?? doc.ownerAddress ?? null,
    }));

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return res.json({ items: normalized, page, pageSize, total, totalPages });
  } catch (err) {
    console.error("Market materials error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
