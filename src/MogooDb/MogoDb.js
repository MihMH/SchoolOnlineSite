const { MongoClient, ServerApiVersion, Double } = require('mongodb');
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const uri = "mongodb+srv://mihm76653_db_user:mihmDb@schoolonlinedb.u0cdn4e.mongodb.net/?appName=SchoolOnlineDB";
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
const AccountSchema=new Schema({
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
const SchoolSchema=new Schema({
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
  Classes:[{
    Class:[{
      TimeTable:[{
        Week:[{
          Day:[{
            Lesson:{
              number:Number,
              title:String,
              text:String,
              time:String,
            }
          }]
        }]
      }],
      Lessons:[{
        Subjects:[{
          task:{
            email:String,
            grade:Number
          }
        }]
      }],
    }]
  }]
})
module.exports = {SchoolSchema,AccountSchema,connectDB,getAccountsCollection,getSchoolsCollection};
