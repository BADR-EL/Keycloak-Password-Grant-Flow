import React, { useState } from 'react';

import Loader from "./Loader";
import "./Public.css";


export default ({login,signup,errorMessage})=>{
	const [email, setEmail] = useState();
    const [firstName, setFirstName] = useState();
	const [familyName, setFamilyName] = useState();
    const [password, setPassword] = useState();
	const [loader, setLoader] = useState(false);

	const logIn= async(email,password)=>{
        setLoader(true)
		await login(email,password);
		setLoader(false)
	}

	const signUp= async(firstname,name,email,password)=>{
		setLoader(true)
		await signup(firstname,name,email,password);
		setLoader(false)
	}

	if(loader)
	  return <Loader/>

    return <div class="login-container">
    <div class="main">  	
		<input type="checkbox" id="chk" aria-hidden="true"/>
		    {errorMessage && <div className="error">{errorMessage}</div>}
			<div class="signup">
				
					<label for="chk" aria-hidden="true">Sign up</label>
					<input onChange={e=>setFirstName(e.target.value)} type="text" name="txt" placeholder="FirstName" required=""/>
					<input onChange={e=>setFamilyName(e.target.value)} type="text" name="txt" placeholder="FamilyName" required=""/>
					<input onChange={e=>setEmail(e.target.value)} type="email" name="email" placeholder="Email" required=""/>
					<input onChange={e=>setPassword(e.target.value)} type="password" name="pswd" placeholder="Password" required=""/>
					<button onClick={()=> signUp(firstName,familyName,email,password)}>Sign up</button>
				
			</div>
			<div class="login">
				
					<label for="chk" aria-hidden="true">Login</label>
					<input onChange={e=>setEmail(e.target.value)} type="email" name="email" placeholder="Email" required=""/>
					<input onChange={e=>setPassword(e.target.value)} type="password" name="pswd" placeholder="Password" required=""/>
					<button onClick={()=> logIn(email,password)}>Login</button>
			</div>
	</div>
    
    </div>
}