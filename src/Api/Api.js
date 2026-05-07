import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import { error } from "console";
import { MongoClient, ServerApiVersion, Double } from 'mongodb';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import path from "path";
import { ObjectId } from "mongodb";
import { fileURLToPath } from "url";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";
import cors from "cors";
const app = express();
app.use(cors())
app.use(express.json());


const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "Data.env") });

const resend=new Resend(process.env.Resend_api_key)
const activeCodes = {};
import {ClassModel,AccountSchema,connectDB,getAccountsCollection,getClassesCollection} from '../MogooDb/MogoDb.js'
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
    Classes:null,
  })
  res.json({message:"Succsesfully created an account!",status:"ok"})
  }catch(err){
      console.error(err);
      res.status(500).json({ error: "Failed to create account" });
  }


})
app.post("/createClass",async(req,res)=>{
  const {TimeTable,Lessons,ClassName,token}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  let acc=null
  let email=null
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
      
    }
    else{
      acc=user
    }
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to create a Class" });
  }
  try{
    const Class=await ClassModel.create({
      Name:ClassName,
      News:[],
      People:[{ id: acc._id.toString(), role: "admin" }],
      TimeTable:TimeTable,
      Lessons:Lessons,
      Inbox:[]
    })
    res.json({message:"Succsesfully created a Class!",status:"ok"})
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to create a Class" });
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
  const _JWT_SECRET=process.env.JWT_SECRET
  if(check){
    const token = jwt.sign(
      {
        id:user._id.toString(),
      },
      _JWT_SECRET,
      { expiresIn: "1h" }
  );

  res.json({success: true,token});
  }
  else{
    res.json({success:false,message: "wrong email or password"});
  }
})


app.post("/changePassword",async(req,res)=>{
  const {token,oldPassword,newPassword}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    const check=await bcrypt.compare(oldPassword,user.PasswordHash)
    if(check){
      const newPasswordHash = await bcrypt.hash(newPassword,10);
      await accounts.updateOne({ _id: new ObjectId(id) },{$set:{PasswordHash:newPasswordHash}})
      res.json({success: true,message:"Password changed successfully!"});
    }
    else{
      res.json({success:false,message: "wrong old password"});
    }
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
})

app.post("/deleteAccount",async(req,res)=>{
  const {token,password}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    const check=await bcrypt.compare(password,user.PasswordHash)
    if(check){

      let classes=await getClassesCollection()
      await classes.updateMany(
        { "People.id": id },
        { $pull: { People: { id: id } } }
      );
      await accounts.deleteOne({ _id: new ObjectId(id) })
      res.json({success: true,message:"Account deleted successfully!"});
    }
    else{
      res.json({success:false,message: "wrong password"});
    }
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
})

app.post("/deleteClass",async(req,res)=>{
  const {token,classId}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToDelete=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToDelete){
      res.status(400).json({ error: "Class not found" });
    }
    const isAdmin=classToDelete.People.some(p=>p.id===id && p.role==="admin")
    if(isAdmin){
      await classes.deleteOne({_id:new ObjectId(classId)})
      await accounts.updateMany(
        { "Classes": classId },
        { $pull: { Classes: classId } }
      );
      res.json({success: true,message:"Class deleted successfully!"});
    }
    else{
      res.json({success:false,message: "You are not an admin of this class"});
    }
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to delete class" });
  }
})

//code to change the email
app.post("/changeEmail",async(req,res)=>{
  const {token,email,password}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    const check=await bcrypt.compare(password,user.PasswordHash)
    if(check){
      await accounts.updateOne({ _id: new ObjectId(id) },{$set:{Email:email}})
      res.json({success: true,message:"Email changed successfully!"});
    }
    else{
      res.json({success:false,message: "wrong password"});
    }
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to change email" });
  }
})

app.post("/changeFIO",async(req,res)=>{
  const {token,fio,password}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    const check=await bcrypt.compare(password,user.PasswordHash)
    if(check){
      await accounts.updateOne({ _id: new ObjectId(id) },{$set:{FIO:fio}})
      res.json({success: true,message:"Full name changed successfully!"});
    }
    else{
      res.json({success:false,message: "wrong password"});
    }
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to change full name" });
  }
})


app.post("/joinClass",async(req,res)=>{
  const {token,classId}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToJoin=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToJoin){
      res.status(400).json({ error: "Class not found" });
    }
    const isAlreadyInClass=classToJoin.People.some(p=>p.id===id)
    if(isAlreadyInClass){
      res.status(400).json({ error: "You are already in this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$push:{Inbox:{senderId:id}}})
    res.json({success: true,message:"Join request sent to the class admin!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to join class" });
  }
})



app.post("/acceptJoinRequest",async(req,res)=>{
  const {token,classId,userId}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToJoin=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToJoin){
      res.status(400).json({ error: "Class not found" });
    }
    const isAdmin=classToJoin.People.some(p=>p.id===id && p.role==="admin")
    if(!isAdmin){
      res.status(400).json({ error: "You are not an admin of this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$pull:{Inbox:{senderId:userId}}})
    await classes.updateOne({_id:new ObjectId(classId)},{$push:{People:{id:userId,role:"student"}}})
    await accounts.updateOne({_id:new ObjectId(userId)},{$push:{Classes:classId}})
    res.json({success: true,message:"Join request accepted!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to accept join request" });
  }
})
//code to reject join request
app.post("/rejectJoinRequest",async(req,res)=>{
  const {token,classId,userId}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToJoin=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToJoin){
      res.status(400).json({ error: "Class not found" });
    }
    const isAdmin=classToJoin.People.some(p=>p.id===id && p.role==="admin")
    if(!isAdmin){
      res.status(400).json({ error: "You are not an admin of this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$pull:{Inbox:{senderId:userId}}})
    res.json({success: true,message:"Join request rejected!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to reject join request" });
  }
})

app.post("/leaveClass",async(req,res)=>{
  const {token,classId}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToLeave=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToLeave){
      res.status(400).json({ error: "Class not found" });
    }
    const isInClass=classToLeave.People.some(p=>p.id===id)
    if(!isInClass){
      res.status(400).json({ error: "You are not in this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$pull:{People:{id:id}}})
    await accounts.updateOne({_id:new ObjectId(id)},{$pull:{Classes:classId}})
    res.json({success: true,message:"Left class successfully!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to leave class" });
  }
})


app.post("/removeStudent",async(req,res)=>{
  const {token,classId,userId}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToModify=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToModify){
      res.status(400).json({ error: "Class not found" });
    }
    const isAdmin=classToModify.People.some(p=>p.id===id && p.role==="admin")
    if(!isAdmin){
      res.status(400).json({ error: "You are not an admin of this class" });
    }
    const isInClass=classToModify.People.some(p=>p.id===userId)
    if(!isInClass){
      res.status(400).json({ error: "User is not in this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$pull:{People:{id:userId}}})
    await accounts.updateOne({_id:new ObjectId(userId)},{$pull:{Classes:classId}})
    res.json({success: true,message:"Student removed from class successfully!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to remove student from class" });
  }
})

app.post("/addNews",async(req,res)=>{
  const {token,classId,news}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToModify=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToModify){
      res.status(400).json({ error: "Class not found" });
    } 
    const isAdmin=classToModify.People.some(p=>p.id===id && p.role==="admin")
    if(!isAdmin){
      res.status(400).json({ error: "You are not an admin of this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$push:{News:news}})
    res.json({success: true,message:"News added to class successfully!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to add news to class" });
  }
})

app.post("/removeNews",async(req,res)=>{
  const {token,classId,news}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToModify=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToModify){
      res.status(400).json({ error: "Class not found" });
    }
    const isAdmin=classToModify.People.some(p=>p.id===id && p.role==="admin")
    if(!isAdmin){
      res.status(400).json({ error: "You are not an admin of this class" });
    }
    const newsExists=classToModify.News.some(n=>n===news)
    if(!newsExists){
      res.status(400).json({ error: "News not found in this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId)},{$pull:{News:news}})
    res.json({success: true,message:"News removed from class successfully!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to remove news from class" });
  }
})

//code to change user role in class
app.post("/changeUserRole",async(req,res)=>{
  const {token,classId,userId,newRole}=req.body
  const _JWT_SECRET=process.env.JWT_SECRET
  try{
    const decoded = jwt.verify(token, _JWT_SECRET);
    const id = decoded.id;
    let accounts=await getAccountsCollection()
    let user=await accounts.findOne({ _id: new ObjectId(id) })
    if(!user){
            res.status(400).json({ error: "Account not found" });
    }
    let classes=await getClassesCollection()
    let classToModify=await classes.findOne({_id:new ObjectId(classId)})
    if(!classToModify){
      res.status(400).json({ error: "Class not found" });
    }
    const isAdmin=classToModify.People.some(p=>p.id===id && p.role==="admin")
    if(!isAdmin){
      res.status(400).json({ error: "You are not an admin of this class" });
    }
    const isInClass=classToModify.People.some(p=>p.id===userId)
    if(!isInClass){
      res.status(400).json({ error: "User is not in this class" });
    }
    await classes.updateOne({_id:new ObjectId(classId), "People.id": userId},{$set:{"People.$.role":newRole}})
    res.json({success: true,message:"User role changed successfully!"});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Failed to change user role in class" });
  }
})
