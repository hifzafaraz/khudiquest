const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Cloud Connection Registry
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB Cloud Connected Successfully! ✨");
    }
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

// Auto-Trigger Connection
connectDB();

// Schema Definitions for Khudi Quest
const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const taskSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const UserModel = mongoose.model('User', userSchema);
const TaskModel = mongoose.model('Task', taskSchema);

// NeDB to Mongoose Adapter Interface (Saves your existing routes from breaking)
const User = {
  insert: async (doc) => { await connectDB(); return await UserModel.create(doc); },
  find: async (query) => { await connectDB(); return await UserModel.find(query).lean(); },
  findOne: async (query) => { await connectDB(); return await UserModel.findOne(query).lean(); },
  update: async (query, update, options) => { 
    await connectDB(); 
    return await UserModel.updateMany(query, update, { multi: true, ...options }); 
  },
  remove: async (query, options) => { 
    await connectDB(); 
    return await UserModel.deleteMany(query); 
  }
};

const TasksDB = {
  insert: async (doc) => { await connectDB(); return await TaskModel.create(doc); },
  find: async (query) => { await connectDB(); return await TaskModel.find(query).lean(); },
  findOne: async (query) => { await connectDB(); return await TaskModel.findOne(query).lean(); },
  update: async (query, update, options) => { 
    await connectDB(); 
    return await TaskModel.updateMany(query, update, { multi: true, ...options }); 
  },
  remove: async (query, options) => { 
    await connectDB(); 
    return await TaskModel.deleteMany(query); 
  }
};

module.exports = {
  User,
  TasksDB,
  getDatastorePath: () => "" // Keeps compatibility intact if called elsewhere
};
