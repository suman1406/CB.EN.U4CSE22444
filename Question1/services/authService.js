const axios = require('axios');

const AUTH_CONFIG = {
  email: "psuman7155@gmail.com",
  name: "suman panigrahi",
  rollNo: "cb.en.u4cse22444",
  accessCode: "SwuuKE",
  clientID: "b255e036-19d5-4835-af83-4b72d215fb1b",
  clientSecret: "YYApHkhMQPVNepUU"
};

let authToken = null;
let tokenExpiry = null;

async function getAuthToken() {
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    return authToken;
  }

  try {
    const response = await axios.post('http://20.244.56.144/evaluation-service/auth', AUTH_CONFIG);
    authToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000);
    return authToken;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    throw new Error('Failed to authenticate with the service');
  }
}

module.exports = {
  getAuthToken
}; 