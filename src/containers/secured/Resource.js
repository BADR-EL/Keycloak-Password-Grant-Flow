import React, { useState, useEffect, useCallback } from "react";

import Keycloak from "../keycloak/Keycloak";
import ResourceInfo from "../../components/secured/Resource";
import Loader from "../../components/public/Loader";
import { getResource } from "../../middleware/Api";

const Resource = (props) => {
  const [resource, setResource] = useState();
  const [isInfoLoading, setIsInfoLoading] = useState(true);

  const { accesToken } = props;

  const loadResource = useCallback(async () => {
    try {
      const response = await getResource(accesToken);
      setResource(JSON.stringify(response));
    } catch (err) {
      setResource(err.message);
    }
  }, [accesToken]);

  useEffect(() => {
    setIsInfoLoading(true);
    loadResource().then(() => {
      setIsInfoLoading(false);
    });
  }, [loadResource]);

  if (isInfoLoading) return <Loader />;

  return <ResourceInfo {...{ resource }} />;
};

export default Keycloak(Resource);
