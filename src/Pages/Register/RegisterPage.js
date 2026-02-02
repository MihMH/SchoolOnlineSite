import { useState } from "react";
import "./RegisterPage.css"

function RegisterPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fio, setFio] = useState("");
    const [error,setError]=useState("")
    const onSubmitHandler=(e)=>{
        e.preventDefault();
        
    }
    return(
        <div className="PageContainer">
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
    )

}