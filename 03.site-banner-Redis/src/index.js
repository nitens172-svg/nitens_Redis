import express from "express";
import Redis from "ioredis";
const app = express();
app.use(express.json());
// create a new Redis client instance

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
const BANNER_KEY = "app:banner";
app.post("/banner", async (req, res) => {
    await redis.set(BANNER_KEY, req.body.message || "Welcome to Chai aur Redis!");
    res.status(201).json({ message: "Banner updated successfully!" ,
        success: true
    });
});

app.get("/banner", async (req, res) => {
   const message = await redis.get(BANNER_KEY);
   res.json({ message: message || "No banner set yet." })
});

app.delete("/banner", async (req, res) => {
   const message =  await redis.del(BANNER_KEY);
    res.json({ message:!!message})
});

app.get("/banner/exists", async (req, res)=>{
    const exists = await redis.exists(BANNER_KEY);
    res.json({ exists: Boolean(exists) })
    // this converts the numeric response from Redis (0 or 1) to a 
    // boolean value (false or true) before sending it back in the
    //  JSON response.
    // res.json({ exists: !!exists })
    //  this converts any truthy value to true and any falsy value to false, 
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})