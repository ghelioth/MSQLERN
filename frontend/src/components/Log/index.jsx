import React, { useState } from 'react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';

const Log = (props) => {
    const [signUpModal, setSignUpModal] = useState(props.signup);
    const [signInModal, setSignInModal] = useState(props.signin); 

    const handleOnClick = (e) => {
        if (e.target.id === "register") {
            setSignUpModal(true);
            setSignInModal(false);
        }else if (e.target.id === "login") {
            setSignUpModal(false);
            setSignInModal(true);
        }
    }


    return (
        <div className="connection-form">
            <div className="form-container">
                <ul>
                    <li onClick={handleOnClick} id="register" className={signUpModal ? "active-btn" : null}>
                        S'inscrire 
                    </li>
                    <li onClick={handleOnClick} id="login" className={signInModal ? "active-btn" : null} >
                        Se connecter  
                    </li>
                </ul>
                {signUpModal && <SignUpForm />}
                {signInModal && <SignInForm />}
            </div>
        </div>
    );
};
export default Log;