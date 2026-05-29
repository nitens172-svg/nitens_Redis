import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();
// create a new Redis client instance
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
//  we can pass many parameters to the Redis constructor, such as host, port,
//   password, and more. In this case, we are using the default Redis URL, which is
//   redis://localhost:6379, to connect to a Redis server running on the local machine.

app.get("/redis", async (req, res) => {
        // set a key-value pair in Redis
       const reply = await redis.ping();
       res.send(`Connected to Redis! ${reply}`); 
})

app.get("/mongo", async (req, res) => {
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/chai_aur_redis";
   if(mongoose.connection.readyState === 0){
      await mongoose.connect(mongoUrl);
   }
   res.send(`Connected to MongoDB!, ${mongoose.connection.name }: ${mongoose.connection.host}`)
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})