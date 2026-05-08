import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import "./RegisterPage.css"

function RegisterPage(){
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fio, setFio] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const onSubmitHandler = (e) => {
        e.preventDefault();
        if (!fio || !email || !password) {
            setError(t('fillAllFields'));
            return;
        }
        // In real app this would send to backend
        console.log("Register attempt:", { fio, email, password });
        setError("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
        setFio("");
        setEmail("");
        setPassword("");
    }

    return(
        <div className="PageContainer">
            <div className="RegisterContainer">
                <h1>{t('registerTitle')}</h1>
                {success && <p className="success">{t('registeredSuccess')}</p>}
                <form onSubmit={(e) => onSubmitHandler(e)}>
                    <div className="FIOContainer">
                        <label>{t('fullName')}</label>
                        <input 
                            onChange={(e) => setFio(e.target.value)} 
                            type="text" 
                            placeholder="John Doe"
                            value={fio}
                        />
                    </div>
                    <div className="EmailContainer">
                        <label>{t('contactEmail')}</label>
                        <input 
                            onChange={(e) => setEmail(e.target.value)} 
                            type="email" 
                            placeholder="test@example.com"
                            value={email}
                        />
                    </div>
                    <div className="PasswordContainer">
                        <label>{t('password')}</label>
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            type="password" 
                            placeholder="Enter a secure password"
                            value={password}
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit">{t('register')}</button>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;