import React, { useState, useEffect, useCallback } from "react";

import Keycloak from "../keycloak/Keycloak";
import UserInfo from "../../components/secured/User";
import Loader from "../../components/public/Loader";
import TokenParser from "../../helper/TokenParser";

const User = (props) => {
  const [familyName, setFamilyName] = useState();
  const [givenName, setGivenName] = useState();
  const [email, setEmail] = useState();
  const [isInfoLoading, setIsInfoLoading] = useState(true);

  const { accesToken } = props;

  const loadUserInfo = useCallback( () => {
      const response = TokenParser(accesToken);
      setFamilyName(response.family_name);
      setGivenName(response.given_name);
      setEmail(response.email);
  }, [accesToken]);

  useEffect(() => {
    setIsInfoLoading(true);
    loadUserInfo();
    setIsInfoLoading(false);
  }, [loadUserInfo]);

  if (isInfoLoading) return <Loader />;

  return <UserInfo {...{ email, familyName, givenName }} />;
};

export default Keycloak(User);
