const mongoose=require("mongoose");
const express=require("express");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const router=express.Router();

const User = mongoose.model("User", new mongoose.Schema({email:String,password:String}));

// signup route
router.post("/auth/signup", async(req,res)=>{
    const {email, password}=req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        res.status(400).json({error: "User already exists"});
    }
    // const hashedPassword= await bcrypt.hash([password]);
    const hashedPassword= await bcrypt.hash(password, 10);
    const newUser = new User ({email,password:hashedPassword});
    await newUser.save();
    const token = jwt.sign({userId:newUser._id},'secret',{expiresIn:'1h'});
    res.status(200).json({token});
})

//login route
router.post("/auth/login",async (req,res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user && await bcrypt.compare(password, user.password)){
        const token = jwt.sign({userId:user._id},"secret",{expiresIn:"1h"});
        res.status(200).json({token});
    }else{
        res.status(400).json({error: "Invalid credentials"});
    }
})

//jwt authentication
function authenticateJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if (authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "secret", (err,user)=>{
            if(err){
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        })
    }else{
        res.sendStatus(401);
    }
}

module.exports={router, authenticateJWT};