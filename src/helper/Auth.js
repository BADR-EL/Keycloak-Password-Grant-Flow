
let timer;
let nbOfConnexions;
let responseTime = 5; // this in (s). the token expiryDate = realExpirationDate-responseTime

export const authenticate = (
  tokenExpiryTime,
  refreshTokenExpiryTime
) => {
    nbOfConnexions = Math.floor(refreshTokenExpiryTime / tokenExpiryTime); // this may not be exact in one case, but it will work like it should
    setLogoutTimer(tokenExpiryTime);
};

export const signup = async (firstName,lastName, email, password) => {
    const response = await fetch("http://localhost:82/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName:firstName,
        lastName:lastName,
        userName: email,
        email: email,
        password: password,
        language:'en'
      }),
    });

    if (!response.ok) {
      const errorResData = await response.json();
      throw new Error("An error occured"); 
    }

    const resData = await response.text();
    console.log("ResData", resData);
    if (
      resData === "User exists with same username" ||
      resData === "User exists with same email"
    )
      throw new Error("User exists with same username / email");

    if(resData==="The user is not created")
      throw new Error("The user is not created");

    try{
      await signin(email, password);
    }catch (err) {
      throw err;
    }
  };

export const signin = async (email, password) => {
    var details = {
      userName: email,
      password: password,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    try {
      const response = await fetch("http://localhost:82/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: formBody,
      });
      if (!response.ok) {
        let message = "An error occured";
        throw new Error(message);
      }

      const resData = await response.json();
      if (resData.success_indicator !== "success") {
        const errorMessage = resData.error_description;
        let message = errorMessage;
        throw new Error(message);
      }
      
        authenticate(
          parseInt(resData.expires_in - responseTime) * 1000,
          parseInt(resData.refresh_expires_in) * 1000
        )
  
      const expirationDate = new Date(
        new Date().getTime() +
          parseInt(resData.expires_in - responseTime) * 1000
      ); //*1000 to convert to ms because get Time is in ms
      const refreshTokenExpiryDate = new Date(
        new Date().getTime() + parseInt(resData.refresh_expires_in) * 1000
      );
      saveDataToStorage(
        resData.access_token,
        expirationDate,
        resData.refresh_token,
        refreshTokenExpiryDate
      );
    } catch (err) {
      throw err;
    }
};

export const refreshToken = async () => {
    const userData = await localStorage.getItem("userData");
    const transformedData = JSON.parse(userData);
    const { refreshToken } = transformedData;
    var details = {
      refreshToken: refreshToken,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    try {
      const response = await fetch(
        "http://localhost:82/api/refreshToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: formBody,
        }
      );
      if (!response.ok) {
        let message = "An error occured";
        throw new Error(message);
      }

      const resData = await response.json();
      if (resData.success_indicator !== "success") {
        const errorMessage = resData.error_description;
        let message = "an error occured";
        if (errorMessage === "Invalid refresh token") {
          message = "Invalid refresh token!";
        }
        throw new Error(message);
      }
      clearLogoutTimer();
      
      authenticate(
        parseInt(resData.expires_in - responseTime) * 1000,
        parseInt(resData.refresh_expires_in) * 1000
      );

      const expirationDate = new Date(
        new Date().getTime() +
          parseInt(resData.expires_in - responseTime) * 1000
      ); //*1000 to convert to ms because get Time is in ms
      const refreshTokenExpiryDate = new Date(
        new Date().getTime() + parseInt(resData.refresh_expires_in) * 1000
      );
      localStorage.removeItem("userData"); // remove old data
      saveDataToStorage(
        resData.access_token,
        expirationDate,
        resData.refresh_token,
        refreshTokenExpiryDate
      );
    } catch (err) {
      logout();
      throw err
    }
};

export const logout = () => {
  clearLogoutTimer();
  nbOfConnexions = 0;
  localStorage.removeItem("userData");
  window.dispatchEvent( new Event('storage') )
};

const clearLogoutTimer = () => {
  if (timer) clearTimeout(timer);
};

const setLogoutTimer = (expirationTime) => {
    timer = setTimeout(() => {
      if (nbOfConnexions > 0) {
        clearLogoutTimer();
        nbOfConnexions--;
        refreshToken();
      } else {
        logout();
      }
    }, expirationTime);
};

const saveDataToStorage = (
  token,
  expirationDate,
  refreshToken,
  refreshTokenExpiryDate
) => {
  localStorage.setItem(
    "userData",
    JSON.stringify({
      token: token,
      expiryDate: expirationDate.toISOString(),
      refreshToken: refreshToken,
      refreshTokenExpiryDate: refreshTokenExpiryDate.toISOString(),
    })
  );
  window.dispatchEvent( new Event('storage') )
};
