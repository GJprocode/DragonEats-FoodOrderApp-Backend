import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(()=> console.log("Connected to database!"));

const app = express();
app.use(express.json());
app.use(cors());

//test
app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "Health ok!" });
});

app.use("/api/my/user", myUserRoute);

app.listen(7000, ()=> {
    console.log("Server started on Localhost:7000 ")

});