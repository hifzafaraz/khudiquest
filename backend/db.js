const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

if (!uri) {
  console.error("MONGODB_URI is completely missing in environment variables.");
}

// Global caching to safely reuse connections in Vercel's serverless environment.
// This avoids creating a brand-new MongoClient on every request (which causes
// connection exhaustion and the tlsv1/SSL errors you were seeing).
let clientPromise;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function connectDB() {
  try {
    const connectedClient = await clientPromise;
    // Explicitly target the database so it doesn't fall back to "test"
    return connectedClient.db('khudiquest');
  } catch (err) {
    console.error("Serverless pool matching connection failed:", err.message);
    // Reset the cache so the next invocation retries a fresh connection
    global._mongoClientPromise = null;
    throw err;
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