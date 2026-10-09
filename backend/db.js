const { MongoClient } = require('mongodb');
require('dotenv').config();

let cachedClient = null;
let cachedDb = null;

// Global Connection Pool optimized for Vercel Serverless Architecture
async function connectDB() {
  // If connection is already alive and active, reuse it instantly
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    console.error("Database connection failed: MONGODB_URI is missing in environment variables.");
    return null;
  }

  try {
    // Standard pool configuration to prevent "Topology is closed" issues
    cachedClient = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await cachedClient.connect();
    cachedDb = cachedClient.db(); // Automatically extracts database name from URI
    
    console.log("MongoDB Cloud Native Pool Connected Successfully! ✨");
    return cachedDb;
  } catch (err) {
    console.error("Delayed serverless database connection matching failed:", err.message);
    cachedClient = null;
    cachedDb = null;
    return null;
  }
}

// NeDB to MongoDB Native Dynamic Mapping Adapter
const User = {
  insert: async (doc) => {
    const database = await connectDB();
    const result = await database.collection('users').insertOne({ ...doc });
    return { _id: result.insertedId, ...doc };
  },
  find: async (query) => {
    const database = await connectDB();
    return await database.collection('users').find(query).toArray();
  },
  findOne: async (query) => {
    const database = await connectDB();
    return await database.collection('users').findOne(query);
  },
  update: async (query, update, options = {}) => {
    const database = await connectDB();
    const updateDoc = update.$set ? update : { $set: update };
    return await database.collection('users').updateMany(query, updateDoc, { upsert: options.upsert || false });
  },
  remove: async (query) => {
    const database = await connectDB();
    return await database.collection('users').deleteMany(query);
  }
};

const TasksDB = {
  insert: async (doc) => {
    const database = await connectDB();
    const result = await database.collection('tasks').insertOne({ ...doc });
    return { _id: result.insertedId, ...doc };
  },
  find: async (query) => {
    const database = await connectDB();
    return await database.collection('tasks').find(query).toArray();
  },
  findOne: async (query) => {
    const database = await connectDB();
    return await database.collection('tasks').findOne(query);
  },
  update: async (query, update, options = {}) => {
    const database = await connectDB();
    const updateDoc = update.$set ? update : { $set: update };
    return await database.collection('tasks').updateMany(query, updateDoc, { upsert: options.upsert || false });
  },
  remove: async (query) => {
    const database = await connectDB();
    return await database.collection('tasks').deleteMany(query);
  }
};

module.exports = {
  User,
  TasksDB,
  getDatastorePath: () => ""
};
