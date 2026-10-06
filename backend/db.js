const path = require('path');
const os = require('os');
const fs = require('fs');
const Datastore = require('nedb-promises');

// Resolves a safe, writable directory for datastores.
// In Vercel serverless environments, only /tmp is writable.
// In local development, ./data is used.
function getDatastorePath(dbName) {
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const targetDir = isVercel ? os.tmpdir() : path.join(__dirname, 'data');

  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (err) {
      console.warn('Could not create directory for database:', err.message);
    }
  }

  return path.join(targetDir, dbName);
}

const User = Datastore.create({
  filename: getDatastorePath('users.db'),
  autoload: true
});

const TasksDB = Datastore.create({
  filename: getDatastorePath('tasks.db'),
  autoload: true
});

module.exports = {
  User,
  TasksDB,
  getDatastorePath
};
