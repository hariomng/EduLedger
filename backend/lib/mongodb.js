const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set in environment variables");
}

let client = null;
let clientPromise = null;

if (!global._mongoClientPromise && uri) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function getDb() {
  if (clientPromise === null) {
    return null;
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "eduledger";
  return client.db(dbName);
}

module.exports = { getDb };
