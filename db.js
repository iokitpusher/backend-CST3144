import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI; //make sure this is defined in the .env file and is correct otehrwise issues can arise
const dbName = process.env.DB_NAME || "afterschool";

if (!uri) {
  throw new Error("MONGODB_URI is not set in .env");
}

const client = new MongoClient(uri, { maxPoolSize: 10 });
let db = null;


export async function connectDB() {
  if (db) return db; //if already set up, return
  await client.connect();
  db = client.db(dbName);
  console.log("Out here -- connected to Mongo atlas: ", dbName);
  return db;
}

export function getDB() {
  if (!db) throw new Error("db is not inited.. call init first??");
  return db;
}

export { ObjectId };