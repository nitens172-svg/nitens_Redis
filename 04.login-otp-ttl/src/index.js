// why do we need docker compose file to run redis and mongo together ?
// 1. Simplified Setup: Docker Compose allows you to define and manage multiple services (like Redis and MongoDB) in a single YAML file, making it easier to set up and run your application with all its dependencies.

// 2. Consistent Environment: Using Docker Compose ensures that everyone on your team is running the same versions of Redis and MongoDB, which can help avoid issues related to environment differences.
// 3. Easy Networking: Docker Compose automatically creates a network for your services, allowing them to communicate with each other using service names (e.g., redis, mongo) instead of IP addresses.
// 4. Persistent Data: With Docker Compose, you can easily set up volumes to persist data for Redis and MongoDB, ensuring that your data is not lost when containers are stopped or removed.
import express from "express";
import Redis from "ioredis";
const app = express();
app.use(express.json());
// create a new Redis client instance
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
function otpkey(phone){
    return `otp:${phone}`;
}

app.post("/otp",async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(otpkey(phone), otp, "EX", 300); // valid only for 30 seconds
    //  what are those EX and 300 parameters in the Redis set command?
    // The EX parameter is used to set an expiration time for the key in seconds.
    res.json({ message: `OTP sent to ${phone}`, otp });
}
)

// app.post("/verify/otp", async (req, res)=>{
//      const {otp,phone} = req.body;
//      const message = await redis.exists(otpkey(req.body.phone));
//         if(!!message){
//             const storedOtp = await redis.get(otpkey(req.body.phone));
//             if(storedOtp === otp){
//                 await redis.del(otpkey(req.body.phone));
//                 res.json({ message: "OTP verified successfully" });
//             } else { 
//                 res.status(400).json({ error: "Invalid OTP" });
//             }
//         } else {
//             res.status(400).json({ error: "OTP not found or expired" });
//         }
// })

app.post("/verify/otp", async (req, res)=>{
    try{
         const {otp,phone} = req.body;
        const storedOtp = await redis.get(otpkey(phone));
        console.log("Stored OTP:", storedOtp);
        if(!storedOtp){
            res.status(400).json({ error: "OTP not found or expired" });
        }
        if(storedOtp !== otp){
            res.status(400).json({ error: "Invalid OTP" });
        }
        if(storedOtp === otp){
            res.json({ message: "OTP verified successfully" });
            await redis.del(otpkey(phone));
        }
    } catch(error){
        console.error("Error verifying OTP:", error);
    }
    
})
app.get("/otp/:phone/ttl", async (req, res) => {
    const ttl = await redis.ttl(otpkey(req.params.phone));
     console.log("TTL for OTP:", ttl);
    res.send(`OTP TTL for ${req.params.phone}: ${ttl} seconds`)

})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})
