const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!uri) {
  console.error("MONGODB_URI is completely missing in environment variables.");
}

// Global caching implementation to perfectly handle Vercel Serverless environment lifecycle
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

async function connectDB() {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(); // Extracts the exact collection database automatically
  } catch (err) {
    console.error("Serverless pool matching connection failed:", err.message);
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
