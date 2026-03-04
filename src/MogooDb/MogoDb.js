import { MongoClient, ServerApiVersion, Double } from 'mongodb';
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const uri = "mongodb://mihm76653_db_user:SqLqe06aY4Fj7pSs@" +
  "ac-sd7eoyp-shard-00-00.u0cdn4e.mongodb.net:27017," +
  "ac-sd7eoyp-shard-00-01.u0cdn4e.mongodb.net:27017," +
  "ac-sd7eoyp-shard-00-02.u0cdn4e.mongodb.net:27017" +
  "/OnlineSchool?ssl=true&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let accountsCollection;
let schoolCollection;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const db = client.db("OnlineSchool");
    accountsCollection =await db.collection("Accounts");
    schoolCollection =await db.collection("accounts");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}
function getAccountsCollection() {
  if (!accountsCollection){
    throw new Error("DB not connected yet");
  } 
  return accountsCollection;
}
function getSchoolsCollection() {
  if (!schoolCollection){
    throw new Error("DB not connected yet");
  } 
  return schoolCollection;
}
const Account=new Schema({
  FIO:String,
  PasswordHash:String,
  Email:String,
  Schools:[{
    Subjects:[{
      TaskId:String,
      Grade:Number
    }]
  }]
},{
  timestamps: true
})
const School=new Schema({
  Name:String,
  News:[{
    date:String,
    news:{
      image:String,
      text:String,
      title:String
    }
  }],
  People:[{
    email:String,
    status:String,
    class:String
  }],
  Classes: [
  {
    Name: String,
    Lessons: [
      {
        name: String
      }
    ],
    TimeTable: [
      {
        number: Number,
        days: [
          {
            lessons: [
              {
                time: String,
                number: Number,
                title: String,
                info: String
              }
            ]
          }
        ]
      }
    ]
  }
]
})
const AccountSchema=model("Account",Account,"Accounts")
const SchoolSchema=model("School",School,"schools")
export {
  SchoolSchema,AccountSchema,connectDB,getAccountsCollection,getSchoolsCollection
}

