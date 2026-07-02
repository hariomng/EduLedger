const express = require("express");
const { getDb } = require("../lib/mongodb.js");
const { getUserFromCookie, getUserWalletAddress } = require("../lib/auth.js");

const router = express.Router();

function makeNextLikeRequest(req) {
  return {
    headers: {
      get: (name) => {
        return req.headers[name.toLowerCase()];
      },
    },
    url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
  };
}

router.post("/", async (req, res) => {
  try {
    const fakeReq = makeNextLikeRequest(req);
    const user = await getUserFromCookie(fakeReq);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const {
      title,
      description,
      price,
      usageRights,
      visibility,
      thumbnailUrl,
      fileUrl,
    } = req.body || {};

    if (!title || !fileUrl) return res.status(400).json({ error: "Missing required fields" });

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const userAddress = await getUserWalletAddress(user);

    const doc = {
      clientId: req.clientId || null,
      userAddress,
      title,
      description: description || "",
      price: typeof price === "number" ? price : Number(price) || 0,
      usageRights: usageRights || "",
      visibility: visibility || "private",
      thumbnailUrl: thumbnailUrl || null,
      fileUrl,
      createdAt: new Date(),
    };

    const result = await db.collection("materials").insertOne(doc);
    return res.status(201).json({ id: result.insertedId, ...doc });
  } catch (err) {
    console.error("Create material error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
    const isTopShared = url.searchParams.get("top-shared") === "true";

    if (isTopShared) {
      const featuredMaterial = {
        id: "featured-1",
        title: "ECN 101 – Principles of Microeconomics (Year 1)",
        author: "Chijioke M.",
        price: "0.25 CELO",
        image: "/images/demo1.png",
        description: "Comprehensive introduction to microeconomic principles and theories",
        likes: "52.3K",
        downloads: "18.7K",
        rating: 4.9,
      };

      const topSharedMaterials = [
        {
          id: "top-1",
          title: "CHM 112 – Lab Report (Year 1)",
          price: "0.25 CELO",
          authorImg: "/author1.png",
          author: "CryptoFunks",
          likes: "45.2K",
          downloads: "12.8K",
          rating: 4.8
        },
        {
          id: "top-2",
          title: "GNS 201 – Use of English (Year 2)",
          price: "0.25 CELO",
          authorImg: "/author2.png",
          author: "Cryptix",
          likes: "38.7K",
          downloads: "15.3K",
          rating: 4.6
        },
        {
          id: "top-3",
          title: "CSC 301 – Data Structures (Year 3)",
          price: "0.26 CELO",
          authorImg: "/author3.png",
          author: "Frenesware",
          likes: "42.1K",
          downloads: "11.9K",
          rating: 4.9
        },
        {
          id: "top-4",
          title: "MTH 211 – Linear Algebra",
          price: "0.30 CELO",
          authorImg: "/author4.png",
          author: "PunkArt",
          likes: "35.6K",
          downloads: "9.7K",
          rating: 4.7
        },
        {
          id: "top-5",
          title: "PHY 205 – Quantum Physics",
          price: "0.35 CELO",
          authorImg: "/author5.png",
          author: "BlockChain",
          likes: "41.8K",
          downloads: "13.2K",
          rating: 4.8
        }
      ];

      return res.json({ featured: featuredMaterial, items: topSharedMaterials, total: topSharedMaterials.length, isTopShared: true });
    }

    const isDemo = url.searchParams.get("demo") === "true";
    if (isDemo) {
      const demoMaterials = [
        {
          id: "demo-1",
          title: "CHM 112 – Lab Report Template (UNN)",
          author: "Chijioke M.",
          likes: "21.5K",
          bid: "0.25 CELO",
          time: "01:09:40",
          image: "/images/image1.jpg",
          category: "Science",
          description: "Comprehensive lab report template for Chemistry 112 at University of Nigeria, Nsukka"
        },
        {
          id: "demo-2",
          title: "CSC 201 – Programming Assignment Solutions",
          author: "Adaora N.",
          likes: "18.2K",
          bid: "0.30 CELO",
          time: "02:15:22",
          image: "/images/image2.jpg",
          category: "Computer Science",
          description: "Complete solutions for CSC 201 programming assignments with detailed explanations"
        },
        {
          id: "demo-3",
          title: "MTH 111 – Calculus Study Guide",
          author: "Emeka O.",
          likes: "15.8K",
          bid: "0.20 CELO",
          time: "00:45:33",
          image: "/images/image3.jpg",
          category: "Mathematics",
          description: "Comprehensive study guide covering all topics in MTH 111 Calculus"
        },
        {
          id: "demo-4",
          title: "PHY 101 – Physics Lab Manual",
          author: "Ngozi P.",
          likes: "12.4K",
          bid: "0.35 CELO",
          time: "03:22:11",
          image: "/images/image4.jpg",
          category: "Physics",
          description: "Complete physics laboratory manual with experiments and procedures"
        },
        {
          id: "demo-5",
          title: "ENG 102 – Essay Writing Guide",
          author: "Kelechi R.",
          likes: "9.7K",
          bid: "0.15 CELO",
          time: "01:33:55",
          image: "/images/image5.jpg",
          category: "English",
          description: "Step-by-step guide to academic essay writing with examples"
        },
        {
          id: "demo-6",
          title: "BIO 101 – Biology Flashcards",
          author: "Ifeoma S.",
          likes: "14.1K",
          bid: "0.18 CELO",
          time: "02:08:44",
          image: "/images/image6.jpg",
          category: "Biology",
          description: "Interactive flashcards covering all major topics in Biology 101"
        },
        {
          id: "demo-7",
          title: "ECO 201 – Economics Notes",
          author: "Chukwuma T.",
          likes: "11.3K",
          bid: "0.22 CELO",
          time: "01:57:19",
          image: "/images/image7.jpg",
          category: "Economics",
          description: "Comprehensive notes for ECO 201 Macroeconomics"
        },
        {
          id: "demo-8",
          title: "STA 111 – Statistics Practice Problems",
          author: "Amara U.",
          likes: "8.9K",
          bid: "0.25 CELO",
          time: "02:41:07",
          image: "/images/image8.jpg",
          category: "Statistics",
          description: "500+ practice problems with solutions for STA 111"
        },
        {
          id: "demo-9",
          title: "GST 101 – General Studies Handbook",
          author: "Obinna V.",
          likes: "16.5K",
          bid: "0.12 CELO",
          time: "01:22:38",
          image: "/images/image9.jpg",
          category: "General Studies",
          description: "Complete handbook covering all GST 101 topics"
        }
      ];
      return res.json({ items: demoMaterials, total: demoMaterials.length, isDemo: true});
    }

    const fakeReq = makeNextLikeRequest(req);
    const user = await getUserFromCookie(fakeReq);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const userAddress = await getUserWalletAddress(user);
    const items = await db.collection("materials").find({ userAddress }).sort({ createdAt: -1 }).toArray();

    return res.json(items);
  } catch (err) {
    console.error("List materials error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
