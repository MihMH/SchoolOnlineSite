import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import { error } from "console";

const app = express();
app.use(express.json());

require('dotenv').config({ processEnv: myObject })

const resend=new Resend(process.env.Resend_api_key)
const activeCodes = {};
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

    res.json({ message: "Verification code sent!" });
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
        res.json({message: "Email verified successfully!"})
      }
    }catch(err){
      console.error(err);
      res.status(500).json({ error: "Failed to verify code" });
    }

})