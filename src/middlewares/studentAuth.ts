import { NextFunction,Request,Response } from "express";
import jwt from 'jsonwebtoken';

export const studentAuth = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const auth = req.headers['authorization'];
        if(!auth){
            res.status(403).json({
                message:' Missing token1',
            })
            return;
        }
        try {
            const decoded = jwt.verify(auth, process.env.JWT_USER_SECRET_KEY) ;
            res.json({ message: 'Protected route accessed', user: decoded });
        } catch (error) {
            return res.status(403).json({ message: 'Invalid token' });
        }

    
    }
   
}