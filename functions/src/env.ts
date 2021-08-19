import * as functions from "firebase-functions";

const getEnv = (key: string) => {
  /* 
       I return functions.config().env because I set the env.json values into .env 
       property by running `firebase functions:config:set env="$(cat env.json)"`
    */
  return process.env.FUNCTIONS_EMULATOR === "true"
    ? process.env[key]
    : functions.config().env[key.toLowerCase()];
};

export default getEnv;
