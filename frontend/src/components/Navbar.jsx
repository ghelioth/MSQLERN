import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import Home from '../pages/Home';
import { UidContext } from './AppContext';
import Logout from './Log/Logout';

const Navbar = () => {

    const uid = useContext(UidContext)
    return (
        <nav>
           <div className="nav-container">
                <NavLink to= "/">
                    <div className="logo">
                        <img src="./img/icon.png" alt="icon" />
                        <h3>Raccoont</h3>
                    </div>
                </NavLink>
                {uid ? (
                    <ul>
                        <li></li>
                        <li className='welcome'>
                            <NavLink>
                                <h5>Bonjour 'valeur dynamique'</h5>
                            </NavLink> 
                        </li>
                        <Logout />
                    </ul>
                ) : (
                    <ul>
                        <li></li>
                        <li>
                            <NavLink to="/profil">
                                <img src="./img/icons/login.svg" alt="login" />
                            </NavLink>
                        </li>
                    </ul>
                )}
            </div> 
        </nav>
    );
};

export default Navbar;