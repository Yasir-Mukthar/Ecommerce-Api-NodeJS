
import {User} from '../models/user.model.js';
import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authJwt from '../helpers/jwt.js';

const router = Router();

//get all users
router.get('/users',authJwt(),async (req, res) =>{
    const userList= await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json({success: false, message: 'no user found'});
    }
    else{
        res.status(200).send(userList);
    }
});

//post a user
router.post("/users",authJwt(),async(req, res)=>{
    try{
        const {name, email, passwordHash, phone, isAdmin, street, apartment, city, zip, country} = req.body;
        const user = new User({
            name,
            email,
            passwordHash:bcrypt.hashSync(passwordHash, 10) ,
            phone,
            isAdmin,
            street,
            apartment,
            city,
            zip,
            country
        });
        const newUser = await user.save();
        
        if(!newUser){
            return res.status(400).send('the user cannot be created');
        }
        res.status(201).send( "user created successfully")
                    
    }
    catch(error){
        res.status(500).json({success: false, message: error.toString()});
    }
})

//get a single user
router.get("/users/:id",authJwt(),async(req,res)=>{
    try {
        let id= req.params.id;
        const user=await User.find(     {_id:id}).select("-passwordHash");

        if(!user){
            res.status(500).json({success:false,message:'no user found'});
        }
        else{
            res.status(200).send(user);
        }
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
})


router.post("/login", async(req, res)=>{
    const user= await User.findOne({email:req.body.email});
    const secret = process.env.SECRET;
    if(!user){
        return res.status(400).send('the user not found');
    }
    //compare the password with hashed one 
    if(user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)){
        const token = jwt.sign({
            userId:user.id,
            isAdmin:user.isAdmin
        }, secret, {expiresIn:'1d'});
        res.status(200).send({user:user.email, token:token});
    }
    else{
        res.status(400).send('password is wrong');
    }
} )



export default router;