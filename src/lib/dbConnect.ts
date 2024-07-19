import { promises } from "dns";
import mongoose from "mongoose";

// adding question mark bcz its not sure we'll get isConnected but if we get it's surely number
type ConnectionObject = {
    isConnected?: number 
}

// we can keep it empty bcz we added ? in isConnected
const connection: ConnectionObject = {} 

// we'll get promise in return but we dont care whats inside promise so we using void
async function dbConnect (): Promise<void> {

    // return if db is alr connected
    if (connection.isConnected) {
        console.log("Already connected to database");
        return
    }

    // connect to db if not connected
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})
        connection.isConnected = db.connections[0].readyState
        console.log("DB connected successfully");
    } catch (error) {
        console.log("DB connection failed", error);
        process.exit(1)
    }

}

export default dbConnect;