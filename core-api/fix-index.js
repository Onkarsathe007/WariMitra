const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/visava');
  await client.connect();
  const db = client.db();
  console.log("Dropping phoneNumber_1 index...");
  await db.collection('users').dropIndex('phoneNumber_1');
  console.log("Dropped!");
  await client.close();
}
run().catch(console.error);
