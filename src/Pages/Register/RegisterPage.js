import { useState } from "react";
import "./RegisterPage.css"

function RegisterPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fio, setFio] = useState("");
    const [error,setError]=useState("")
    const [cod,setCod]=useState({display:none})
    const [reg,setReg]=useState({display:inline})
    const [message,setmessage]=useState("")
    const [code,setCode]=useState("")
    const onSubmitHandler=async(e)=>{
        e.preventDefault();
        const request=await fetch("http://localhost:3000/register",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:{
                email:email,
                password:password,
            }
        })
        const data = await request.json();
        if(data.status==="ok"){
            SendCodeHandler(e)
        }
        else{
            setError(data.error)
        }
    }
    const SendCodeHandler=async(e)=>{
        setReg({display:none})
        setCod({display:inline})
        setError("")
        const request=await fetch("http://localhost:3000/send-code",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:{
                email:email,
            }
        })
        const data = await request.json();
        if(data.status==="ok"){
            setmessage(data.message)
        }
        else{
            setError(data.error)
        }
    }
    const ValidateCodeHandler=async(e)=>{
        e.preventDefault();
        const request=await fetch("http://localhost:3000/verify-code",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:{
                email:email,
                code:code,
            }
        })
        const data = await request.json();
        if(data.status==="ok"){
            request=await fetch("http://localhost:3000/create-account",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:{
                email:email,
                password:password,
                fio:fio
            }
            })
            
        }
        else{
            setError(data.error)
        }
    }
    return(
        <div className="PageContainer">
        <div className="RegContainer"  style={reg}>
            <div className="RegisterContainer">
                <form onSubmit={(e)=>onSubmitHandler(e)}>
                    <div className="FIOContainer">
                        <label>Введіть вашу ФІО</label>
                        <input onChange={(e)=>setFio(e.target.value)} type="text" placeholder=""></input>
                    </div>
                    <div className="EmailContainer">
                        <label>Введіть вашу Пошту</label>
                        <input onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="test@gmail.com"></input>
                    </div>
                    <div className="PasswordContainer">
                        <label>Введіть ваш Пароль</label>
                        <input onChange={(e)=>setPassword(e.target.value)} type="Password" placeholder="abc123..."></input>
                    </div>
                    <p color="red">{error}</p>
                    <button type="submit">Зареєструватися</button>
                </form>
            </div>
        </div>
        <div className="CodeContainer" style={cod}>

        </div>
        </div>
    )

}