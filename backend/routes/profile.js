const express = require("express");
const { sendWelcomeEmail } = require("../lib/email.js");
const { getDb } = require("../lib/mongodb.js");
const { createAuthToken, getCachedUser } = require("../lib/auth.js");

const router = express.Router();

router.post("/", express.json(), async (req, res) => {
  try {
    const { fullName, email, institution, country, bio, walletAddress } = req.body || {};
    if (!fullName || !email) return res.status(400).json({ error: "Missing required fields" });

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const users = db.collection("users");

    const walletAddressLower = walletAddress ? walletAddress.toLowerCase() : null;

    const duplicateQuery = walletAddress
      ? { $or: [ { email }, { walletAddress }, { walletAddress: walletAddressLower }, { walletAddressLower } ] }
      : { email };
    const existing = await users.findOne(duplicateQuery);
    if (existing) return res.status(409).json({ error: "Profile already exists" });

    const newUser = {
      fullName,
      email,
      institution: institution || null,
      country: country || null,
      bio: bio || null,
      walletAddress: walletAddress || null,
      clientId: req.clientId || null,
      walletAddressLower: walletAddressLower || null,
      createdAt: new Date().toISOString(),
    };

    const result = await users.insertOne(newUser);
    newUser._id = result.insertedId;

    let emailSent = false;
    try {
      await sendWelcomeEmail(email, fullName);
      emailSent = true;
    } catch (e) {
      console.error("Welcome email failed:", e?.message || e);
    }

    // Create auth token and set cookie
    let token = null;
    try {
      token = createAuthToken(newUser);
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
    } catch (e) {
      console.warn("JWT creation failed:", e?.message || e);
    }

    return res.json({ success: true, user: newUser, emailSent });
  } catch (error) {
    console.error("Profile creation error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const tokenUser = req.user;
    if (!tokenUser?.sub) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await getCachedUser(tokenUser.sub);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Profile /me error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) return res.status(400).json({ error: "Missing address" });

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const users = db.collection("users");
    const addressLower = address.toLowerCase();
    const user = await users.findOne({
      $or: [ { walletAddress: address }, { walletAddressLower: addressLower }, { walletAddress: { $regex: `^${address}$`, $options: "i" } } ]
    });

    const exists = !!user;
    if (exists) {
      try {
        const token = createAuthToken(user);
        res.cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7 * 1000,
        });
      } catch (e) {
        console.warn("JWT_SECRET is not set; cannot create auth cookie on GET /api/profile.", e?.message || e);
      }
    }

    return res.json({ exists, user: user || null });
  } catch (error) {
    console.error("Profile lookup error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
