require('dotenv').config();
const axios = require('axios');

async function addIPToWhitelist() {
  try {
    // Step 1: Get your current public IP
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const currentIP = ipResponse.data.ip;
    console.log(`Current IP: ${currentIP}`);

    // Step 2: Get the MongoDB Atlas Project ID (groupId) from environment variables
    const groupId = process.env.PROJECT_ID;
    const apiUrl = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/accessList`;

    // Step 3: Define your API Key and IP Access List Payload
    const publicKey = process.env.MONGODB_PUBLIC_KEY;
    const privateKey = process.env.MONGODB_PRIVATE_KEY;
    const payload = {
      ipAddress: currentIP,
      comment: 'Automated IP Whitelist Entry',
    };

    // Step 4: Send a POST request to MongoDB Atlas API to update the IP whitelist
    const response = await axios.post(apiUrl, payload, {
      auth: {
        username: publicKey,
        password: privateKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response from MongoDB Atlas: ${response.statusText}`);
  } catch (error) {
    // Type assertion to `Error` or `any` to safely access `message` and other properties
    const err = error as Error;
    console.error('Error adding IP to whitelist:', err.message);
  }
}

addIPToWhitelist();


// cd backend
// PS C:\Users\gertf\Desktop\FoodApp\backend> npx tsc src/utils/whitelistadd.ts
// npx tsc src/utils/whitelistadd.ts



// other
// npm install --save-dev ts-node
// ts-node whitelistadd.ts
//npx ts-node src/utils/whitelistadd.ts

