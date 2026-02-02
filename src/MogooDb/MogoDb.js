const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mihm76653_db_user:mihmDb@schoolonlinedb.u0cdn4e.mongodb.net/?appName=SchoolOnlineDB";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}
module.exports = connectDB;