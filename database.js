import * as dotenv from 'dotenv';
dotenv.config();

import {MongoClient, ObjectId} from "mongodb";
import debug from 'debug';
const debugDb = debug('app:Database');

/** Generate/Parse an ObjectId */
const newId = (str) => new ObjectId(str);

/** Global variable storing the open connection, do not use it directly. */
let _db = null;

/** Connect to the database */
async function connect() {
  if (!_db) {
    try {
      const dbUrl = process.env.MONGO_URI;
      const dbName = process.env.MONGO_DB_NAME;
      const client = await MongoClient.connect(dbUrl);
      _db = client.db(dbName);
      debugDb('Connected to MongoDB.');
    } catch (error) {
      debugDb(`Database connection error: ${error.message}`);
      throw error;
    }
  }
  return _db;
}

/** Connect to the database and verify the connection */
async function ping() {
  const db = await connect();
  await db.command({ping: 1});
  debugDb('Ping.')
}

async function GetAllUsers(){
  const db = await connect();
  return await db.collection('User').find({}).toArray();
}

async function registerUser(user){
  const db = await connect();
  const dbResult = await db.collection('User').insertOne(user);
  return dbResult;
}

async function getUserByEmail(email){
  const db = await connect();
  const user = await db.collection('User').findOne({email: email});
  return user;
}

async function saveAuditLog(log){
  const db = await connect();
  const dbResult = await db.collection('AuditLog').insertOne(log);
  return dbResult;
}

async function findRoleByName(roleName){
  const db = await connect();
  const role = await db.collection('Role').findOne({name: roleName});
  return role;
}

async function getPermissionsByRoles(roles) {
  console.log("Roles input:", roles);
  const db = await connect();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const rolePermissions = await db.collection('Role').find({ name: { $in: roles } }).toArray();

  return rolePermissions.reduce((acc, role) => {
    return { ...acc, ...role.permissions };
  }, {});
}

// test the database connection
ping();

// export functions
export {
  newId,
  connect,
  ping,
  GetAllUsers,
  registerUser,
  getUserByEmail,
  saveAuditLog,
  findRoleByName,
  getPermissionsByRoles
};

