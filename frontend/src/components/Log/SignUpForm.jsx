import React, { useState } from 'react';
import axios from 'axios'
import SignInForm from './SignInForm';

const SignUpForm = () => {
    const [formSubmit, setFormSubmit] = useState(false);
    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verif, setVerif] = useState("");

    
    const handleRegister = async (e) => {
        e.preventDefault();
        const pseudoError = document.querySelector('.pseudo.error');
        const emailError = document.querySelector('.email.error');
        const passwordError = document.querySelector('.password.error');
        const verifError = document.querySelector('.verif.error');
        const termsError = document.querySelector('.terms.error')
        const terms = document.getElementById('terms');

        verifError.innerHTML = "";
        termsError.innerHTML = "";
        pseudoError.innerHTML = "";
        emailError.innerHTML = "";
        passwordError.innerHTML = "";

        if (password !== verif || !terms.checked) {
            if (password !== verif)
                verifError.innerHTML = "Les mots de passe ne correspondent pas";
            if (!terms.checked)
                termsError.innerHTML = "Veillez valider les conditions générales";
        } else {
            await axios ({
                method: "post",
                url: `${import.meta.env.VITE_API_URL}api/user/register`,
                data: {
                    pseudo,
                    email,
                    password
                } 
            })
            .then((res) => {
                console.log(res);
                if (res.data.errors) {
                    pseudoError.innerHTML = res.data.errors.pseudo;
                    emailError.innerHTML = res.data.errors.email;
                    passwordError.innerHTML = res.data.errors.password;
                } else {
                    setFormSubmit(true);
                }
            })
            .catch((err) => console.log(err));
        }
    };


    return (
        <>
        {formSubmit ? (
            <>
                <SignInForm />
                <span></span>
                <h4 className="success"> Enregistrement réussi, veuillez-vous connecter</h4>
            </>
        ) : (
        <form action="" onSubmit={handleRegister} id="sign-up-form">
            <label htmlFor="pseudo">Pseudo</label>
            <br />
            <input type="text" name='pseudo' id='pseudo' onChange={(e) => setPseudo(e.target.value)} value={pseudo} />
            <br />
            <div className="pseudo error"></div>
            <br />
            <label htmlFor="email">Email</label>
            <br />
            <input type="text" name='email' id='email' onChange={(e) => setEmail(e.target.value)} value={email} />
            <br />
            <div className="email error"></div>
            <br />
            <label htmlFor="password">Mot de passe</label>
            <br />
            <input type="password" name='password' id='password' onChange={(e) => setPassword(e.target.value)} value={password} />
            <br />
            <div className="password error"></div>
            <br />
            <label htmlFor="verif">Confirmer le mot de passe</label>
            <br />
            <input type="password"  name='password' id='verif' onChange={(e) => setVerif(e.target.value)} value={verif}/>
            <br />
            <div className="verif error"></div>
            <br />
            <input type="checkbox" id='terms'/>
            <label htmlFor="terms">J'accepte les conditions générales d'utilisations<a href="/" target="_blank" rel='noopener noreferrer'>(CGU)</a></label>
            <br />
            <div className="terms error"></div>
            <br />
            <input type="submit" value="S'inscrire"/>
        </form>
        )}
        </>
    );
};

export default SignUpForm;