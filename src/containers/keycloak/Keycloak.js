import React, { useState, useCallback, useEffect } from "react";

import AuthPage from "../../components/public/AuthPage";
import * as authActions from "../../helper/Auth";
import Loader from "../../components/public/Loader";
import Logout from "../../components/public/Logout";

export default (WrappedComponent) => {
  return (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [goToAuth, setGoToAuth] = useState(false);
    const [accesToken, setAccesToken] = useState(null);
    const [errorMessage, setErrorMessage] = useState();
    

    const login = async (email,password)=>{
      try{
        await authActions.signin(email,password);
      }catch (err) {
        setErrorMessage(err.message)
      }
    }

    const signup = async (firstName,lastName,email,password)=>{
      try{
        await authActions.signup(firstName,lastName,email,password)
      }catch (err) {
        setErrorMessage(err.message)
      }
    }
    
    const tryLogin = useCallback(async () => {
      const userData = await localStorage.getItem("userData");
      setGoToAuth(false)
      if (!userData) {
        setGoToAuth(true);
        setIsLoading(false);
        return;
      }
      const transformedData = JSON.parse(userData);
      const { token, expiryDate, refreshTokenExpiryDate } = transformedData;
      const expirationDate = new Date(expiryDate);
      const refreshTokenExpirationDate = new Date(refreshTokenExpiryDate);
      if (expirationDate <= new Date() || !token) {
        if (refreshTokenExpirationDate <= new Date())
          setGoToAuth(true);
        else authActions.refreshToken().catch((err)=>setErrorMessage(err.message));
        setIsLoading(false);
        return;
      }
      const expirationTime = expirationDate.getTime() - new Date().getTime();
      const refreshExpiryTime =
        refreshTokenExpirationDate.getTime() - new Date().getTime();

      // here set elements to userData
      authActions.authenticate(expirationTime, refreshExpiryTime);
      setAccesToken(token)
      setIsLoading(false);
      return;
    }, []);

  

    useEffect(() => {
      tryLogin();
      const checkLogin=() => {
        setErrorMessage(undefined)
        tryLogin();
        setIsLoading(false);
      }
      window.addEventListener("storage",checkLogin );
      return () => {
        window.removeEventListener("storage",checkLogin);
      };
   }, []);

    if (goToAuth) {
      return (
        <AuthPage 
        login={login}
        signup={signup}
        errorMessage = {errorMessage} 
        />
      );
    }

    if (isLoading) 
      return <Loader/>

    return <>
    <Logout onClick={() => authActions.logout()}/>
    <WrappedComponent {...props} accesToken={accesToken}/>
    </>
  };
};
