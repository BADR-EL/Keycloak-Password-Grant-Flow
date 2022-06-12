import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_HOST,
  responseType: "json",
  timeout: 1000 * 10,
});

const get = (url, { params, body }, method, accesToken) => {
  if (method === "post") {
        return client
          .post(url, body, {
            headers: {
              Authorization: "Bearer " + accesToken,
            },
          })
          .then(({ data }) => data);
      } else {
        return client
          .get(url, {
            headers: {
              Authorization: "Bearer " + accesToken,
            },
          })
          .then(({ data }) => data);
      }
}

export const getResource = (accesToken) =>
  get("/api/v1/SecuredResource", {}, "get", accesToken);
