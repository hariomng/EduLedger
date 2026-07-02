const jwt = require("jsonwebtoken");
const { getDb } = require("./mongodb.js");
const { ObjectId } = require("mongodb");

async function getUserFromCookie(requestLike) {
  const cookieHeader = (requestLike.headers && requestLike.headers.get) ? requestLike.headers.get("cookie") || "" : (requestLike.headers?.cookie || "");
  const cookieMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function getUserWalletAddress(user) {
  let userAddress = user?.walletAddress || user?.address || null;
  if (!userAddress && user?.sub) {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("Database connection unavailable while getting wallet address");
        return null;
      }
      const dbUser = await db.collection("users").findOne({ _id: new ObjectId(user.sub) });
      userAddress = dbUser?.walletAddress || dbUser?.walletAddressLower || null;
    } catch (e) {
      console.warn("User lookup failed while getting wallet address:", e?.message || e);
    }
  }
  return userAddress;
}

function createAuthToken(user, expiresIn = "7d") {
  const payload = {
    sub: user._id?.toString ? user._id.toString() : user._id,
    walletAddress: user.walletAddress,
    address: user.walletAddress,
    email: user.email,
    fullName: user.fullName,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token and return payload
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Token payload or null if invalid
 */
function verifyAuthToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Get user by database ID
 * @param {string} userId - User database ID
 * @returns {Object|null} User object or null if not found
 */
const cachedUserStore = new Map();
const CACHE_TTL_MS = 60 * 1000;

async function getUserById(userId) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection unavailable");
      return null;
    }
    return await db.collection("users").findOne({ _id: new ObjectId(userId) });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

async function getCachedUser(userId) {
  if (!userId) return null;
  const now = Date.now();
  const cached = cachedUserStore.get(userId);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.user;
  }

  const dbUser = await getUserById(userId);
  if (dbUser) {
    cachedUserStore.set(userId, { user: dbUser, ts: now });
  }
  return dbUser;
}

/**
 * Get user by wallet address (case-insensitive)
 * @param {string} walletAddress - Wallet address to search for
 * @returns {Object|null} User object or null if not found
 */
async function getUserByWalletAddress(walletAddress) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection unavailable");
      return null;
    }
    const addressLower = walletAddress.toLowerCase();
    return await db.collection("users").findOne({
      $or: [
        { walletAddress: walletAddress },
        { walletAddressLower: addressLower },
        { walletAddress: { $regex: `^${walletAddress}$`, $options: "i" } },
      ],
    });
  } catch (error) {
    console.error("Error getting user by wallet address:", error);
    return null;
  }
}

/**
 * Create a new user in the database
 * @param {Object} userData - User data object
 * @returns {Object} Created user object with _id
 */
async function createUser(userData) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection unavailable");
      throw new Error("Database unavailable");
    }
    const users = db.collection("users");

    // Normalize wallet address
    const walletAddressLower = userData.walletAddress ? userData.walletAddress.toLowerCase() : null;

    const userDoc = {
      ...userData,
      walletAddressLower,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(userDoc);
    return { _id: result.insertedId, ...userDoc };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update user information
 * @param {string} userId - User database ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated user object or null if not found
 */
async function updateUser(userId, updateData) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection unavailable");
      throw new Error("Database unavailable");
    }
    const users = db.collection("users");

    // Normalize wallet address if being updated
    if (updateData.walletAddress) {
      updateData.walletAddressLower = updateData.walletAddress.toLowerCase();
    }

    updateData.updatedAt = new Date();

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result.value;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Check if user exists by email or wallet address
 * @param {string} email - Email address
 * @param {string} walletAddress - Wallet address (optional)
 * @returns {Object|null} Existing user object or null
 */
async function checkUserExists(email, walletAddress = null) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection unavailable");
      return null;
    }
    const users = db.collection("users");

    const query = walletAddress
      ? {
          $or: [
            { email },
            { walletAddress },
            { walletAddressLower: walletAddress.toLowerCase() }
          ]
        }
      : { email };

    return await users.findOne(query);
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return null;
  }
}

/**
 * Middleware-like function to require authentication
 * @param {Request} request - The incoming request
 * @returns {Object} Object with user and response (if unauthorized)
 */
async function requireAuth(request) {
  const user = await getUserFromCookie(request);
  if (!user) {
    return {
      user: null,
      error: "Unauthorized",
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    };
  }
  return { user, response: null };
}

/**
 * Validate user permissions/roles (extendable for future role-based access)
 * @param {Object} user - User object
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} Whether user has required permissions
 */
function validateUserPermissions(user, requiredRoles) {
  // For now, just check if user exists (can be extended with roles later)
  if (!user) return false;

  // If no specific roles required, just check if user is authenticated
  if (!requiredRoles) return true;

  // Convert to array for consistent checking
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Placeholder for future role-based logic
  // For now, all authenticated users have basic access
  return roles.includes('user') || roles.includes('authenticated');
}

module.exports = { getUserFromCookie, getUserWalletAddress, createAuthToken, verifyAuthToken, getUserById, getCachedUser, getUserByWalletAddress, createUser, updateUser, checkUserExists, requireAuth, validateUserPermissions };
