import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import { error } from "console";
const { MongoClient, ServerApiVersion, Double } = require('mongodb');
import mongoose from 'mongoose';
const jwt = require("jsonwebtoken");
const { Schema, model } = mongoose;

const app = express();
app.use(express.json());

require('dotenv').config({ processEnv: myObject })

const resend=new Resend(process.env.Resend_api_key)
const activeCodes = {};
const {SchoolSchema,AccountSchema,connectDB,getAccountsCollection,getSchoolsCollection}=require('../MogooDb/MogoDb')
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
app.post("/register",async (req,res)=>{
  const {email,password}=req.body;
  connectDB()
  let accounts=getAccountsCollection()
  const existsEmail=accounts.findOne({Email:email})
  if(existsEmail){
    res.status(400).json({error:"Email is already used"})
  }
  const PasswordHash = crypto.createHash("sha256").update(code).digest("hex");
  const existsPassword=accounts.findOne({PasswordHash:PasswordHash})
  if(existsPassword){
    res.status(400).json({error:"Password is already used"})
  }
  res.json({status:"ok"})
  


})

app.post("/send-code",(req,res)=>{
    const { email} = req.body;
    const code = generateCode();
    const expiresAt = Date.now() + 600000; 
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    activeCodes[email] = { codeHash, expiresAt };
    try {
        resend.emails.send({
            from: "no-reply@yourapp.com",
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

app.post("/verify-code",(req,res)=>{
    const { email,code} = req.body;
    if(!code){
      res.status(400).json({error:"Code needed"})
    }
    if(Date.now>activeCodes[email]){
      res.status(400).json({error:"Code expireed"})
    }
    try{
      const IcodeHash=crypto.createHash("sha256").update(code).digest("hex");
      if(IcodeHash!==activeCodes[email].codeHash){
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
  const PasswordHash = crypto.createHash("sha256").update(code).digest("hex");
  const Account=await AccountSchema.create({
    FIO:fio,
    PasswordHash:PasswordHash,
    Email:email,
    Schools:null
  })
  res.json({message:"Succsesfully created an account!",status:"ok"})
  }catch(err){
      console.error(err);
      res.status(500).json({ error: "Failed to create account" });
  }


})

app.post("/login",async(req,res)=>{
  const {email,password}=req.body
  connectDB()
  let accounts=getAccountsCollection()
  const PasswordHash = crypto.createHash("sha256").update(code).digest("hex");
  const check=accounts.findOne({Email:email,PasswordHash:PasswordHash})
  if(check){
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.Email,
        role: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
  );

  res.json({success: true,token});
  }
  else{

  }
})
