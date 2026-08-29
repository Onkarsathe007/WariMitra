const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'core-api/.env' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/visava');
  await client.connect();
  const db = client.db();
  const users = await db.collection('users').find({}).toArray();
  console.log("Users:", users.map(u => ({ id: u._id, email: u.email, phone: u.phoneNumber })));
  const indexes = await db.collection('users').indexes();
  console.log("Indexes:", indexes);
  await client.close();
}
run().catch(console.error);
