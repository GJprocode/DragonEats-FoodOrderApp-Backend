//   C:\Users\gertf\Desktop\FoodApp\backend\src\models\user.ts


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true
    },
    name:{
        type: String,
    },
    address:{ // Renamed field
        type: String,
    },
    city:{
        type: String,
    },
    country:{
        type: String,
    },
    role:{
        type: String,
    },
});

const User = mongoose.model("User", userSchema);
export default User;
