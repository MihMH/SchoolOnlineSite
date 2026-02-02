import crypto from "crypto";
import { useState } from "react";
function Actions(){
    const [ActiveCodes,setActiveCodes]=useState({})
    const Verification_Email=(email)=>{
        fetch("http://localhost:3000/send-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail })
        })
            .then(res => res.json())
            .then(data => console.log(data))
    }
}