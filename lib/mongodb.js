const mongoose = require('mongoose');

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

function connectWithHardTimeout(uri, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('MongoDB connection attempt did not finish within ' + ms + 'ms'));
    }, ms);

    mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: ms,
        connectTimeoutMS: ms,
      })
      .then((m) => {
        clearTimeout(timer);
        resolve(m);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }
    cached.promise = connectWithHardTimeout(process.env.MONGODB_URI, 8000).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
