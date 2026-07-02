const express = require("express");

const router = express.Router();

// GET /api/fetch?url=<encoded URL>
router.get("/", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing url" });
    if (typeof url !== "string" || !url.startsWith("https://")) {
      return res.status(400).json({ error: "Only https:// URLs are allowed" });
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      return res.status(502).json({ error: `Upstream fetch failed with ${resp.status}` });
    }

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await resp.json();
      return res.json(json);
    }

    // Fallback: return text
    const text = await resp.text();
    return res.json({ data: text, contentType });
  } catch (err) {
    console.error("Proxy fetch error:", err);
    return res.status(500).json({ error: "Proxy fetch failed" });
  }
});

module.exports = router;
