import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import { error } from "console";
import { MongoClient, ServerApiVersion, Double } from 'mongodb';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";
const app = express();
app.use(express.json());
dotenv.config()

const resend=new Resend(process.env.Resend_API_KEY)
const activeCodes = {};
import {SchoolSchema,AccountSchema,connectDB,getAccountsCollection,getSchoolsCollection} from '../src/MogooDb/MogoDb.js'
await connectDB()
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
app.post("/register",async (req,res)=>{
  const {email,password}=req.body;

  let accounts=await getAccountsCollection()
  const existsEmail=await accounts.findOne({Email:email})
  if(existsEmail){
    res.status(400).json({error:"Email is already used"})
  }
  const PasswordHash = await bcrypt.hash(password,10);
  const existsPassword=await accounts.findOne({PasswordHash:PasswordHash})
  if(existsPassword){
    res.status(400).json({error:"Password is already used"})
  }
  res.json({status:"ok"})
  


})

app.post("/send-code",async(req,res)=>{
    const { email} = req.body;
    const code = generateCode();
    const expiresAt = Date.now() + 600000; 
    const codeHash = await bcrypt.hash(code,10);
    activeCodes[email] = { codeHash, expiresAt };
    try {
        await resend.emails.send({
            from:"test@resend.dev",
            to: email,
            subject: "Your Verification Code",
            html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`
        });
        
    res.json({ message: "Verification code sent!", status:"ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send code" });
  }

})

app.post("/verify-code",async(req,res)=>{
    const { email,code} = req.body;
    if(!code){
      res.status(400).json({error:"Code needed"})
    }
    if (Date.now() > activeCodes[email].expiresAt){
      res.status(400).json({error:"Code expireed"})
    }
    try{
      const IcodeHash=await bcrypt.compare(code,activeCodes[email].codeHash);
      if(!IcodeHash){
        res.status(400).json({error:"Invalid Code"})
      }
      else{
        delete activeCodes[email]
        res.json({message: "Email verified successfully!",status:"ok"})
      }
    }catch(err){
      console.error(err);
      res.status(500).json({ error: "Failed to verify code" });
    }

})
app.post("/create-account",async(req,res)=>{
  const {email,fio,password}=req.body
  try{
  const PasswordHash = await bcrypt.hash(password,10);
  const Account=await AccountSchema.create({
    FIO:fio.toString(),
    PasswordHash:PasswordHash.toString(),
    Email:email.toString(),
    Schools:null,
    SchoolsAndStatuses:null
  })
  res.json({message:"Succsesfully created an account!",status:"ok"})
  }catch(err){
      console.error(err);
      res.status(500).json({ error: "Failed to create account" });
  }


})

app.post("/login",async(req,res)=>{
  const {email,password}=req.body
  let accounts=await getAccountsCollection()
  let user=await accounts.findOne({Email:email})
  if(!user){
    res.status(400).json({ error: "Account not found" });
  }
  const check=await bcrypt.compare(password,user.PasswordHash)
  if(check){
    const token = jwt.sign(
      {
        Email:email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
  );

  res.json({success: true,token});
  }
  else{
    res.json({success:false,message: "wrong email or password"});
  }
})
