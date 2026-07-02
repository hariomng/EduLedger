const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const demoAuthors = [
      { rank: 1, name: "CryptoFunks", price: "0.25 CELO", change: "+26.52%", color: "text-green-500" },
      { rank: 2, name: "Cryptix", price: "0.25 CELO", change: "+10.52%", color: "text-red-500" },
      { rank: 3, name: "Frenesware", price: "0.25 CELO", change: "+5.52%", color: "text-green-500" },
      { rank: 4, name: "PunkArt", price: "50,008 CELO", change: "+1.52%", color: "text-green-500" },
      { rank: 5, name: "Art Crypto", price: "4,524 CELO", change: "+2.52%", color: "text-red-500" }
    ];
    return res.json({ authors: demoAuthors });
  } catch (err) {
    console.error("Top authors error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
