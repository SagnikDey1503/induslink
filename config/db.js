const mongoose = require("mongoose");

const globalCache = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }

    const dbName = process.env.MONGODB_DB || "induslink";

    globalCache.promise = mongoose
      .connect(uri, {
        dbName
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  globalCache.conn = await globalCache.promise;
  global.mongoose = globalCache;
  return globalCache.conn;
}

module.exports = dbConnect;
