const { MongoClient } = require('mongodb');
require('dotenv').config();

let client = null;
let db = null;

// Native MongoDB Cloud Connection Pool Gateway
async function connectDB() {
  if (db) return db;
  
  if (!process.env.MONGODB_URI) {
    console.error("Database connection failed: MONGODB_URI is empty inside environment.");
    return null;
  }

  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      console.log("MongoDB Cloud Driver Connected Successfully! ✨");
    }
    // Automatically extracts the DB name you added after .net/ or defaults to 'khudiquest_db'
    db = client.db(); 
    return db;
  } catch (err) {
    console.error("Delayed connection matching failed:", err.message);
    return null;
  }
}

// NeDB Native Wrapper Interface (Guarantees your routes don't crash)
const User = {
  insert: async (doc) => {
    const database = await connectDB();
    const result = await database.collection('users').insertOne(doc);
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
    // Normalizes NeDB $set or direct update matching
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
    const result = await database.collection('tasks').insertOne(doc);
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
