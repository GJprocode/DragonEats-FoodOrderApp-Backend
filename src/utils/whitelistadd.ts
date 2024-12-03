// does not work after adding email authentication so just increased api ip address range
// for less frequent manually adding whitelisted IP in networks tab, leave for now. 

require('dotenv').config();
const axios = require('axios');

// Function to get current public IP
async function getCurrentIP() {
  const response = await axios.get('https://api.ipify.org?format=json');
  return response.data.ip;
}

// Function to add IP to MongoDB Atlas whitelist
async function addIPToWhitelist() {
  try {
    const currentIP = await getCurrentIP();
    console.log(`Current IP: ${currentIP}`);
    
    const groupId = process.env.PROJECT_ID;
    const apiUrl = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/accessList`;
    
    const publicKey = process.env.MONGODB_PUBLIC_KEY;
    const privateKey = process.env.MONGODB_PRIVATE_KEY;
    
    const payload = {
      ipAddress: currentIP,
      comment: 'Automated IP Whitelist Entry',
    };

    const response = await axios.post(apiUrl, payload, {
      auth: {
        username: publicKey,
        password: privateKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('IP successfully added:', response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
  }
  
}

// Run the function to add IP to the whitelist
addIPToWhitelist();


// npx ts-node src/utils/whitelistadd.ts