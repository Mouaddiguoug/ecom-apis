import { Router } from 'express';
import session from '../index.js';
import { nanoid } from 'nanoid';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import {registerValidation} from '../validation.js';
import jwt from 'jsonwebtoken';

import userModel from '../models/user.js'; 
const auth = Router();

auth.post("/Register", async (req, res) => {
    try {     
        if(registerValidation(req).hasOwnProperty("error"))
            res.status(401).json(registerValidation(req).error.message)
        else if(!req.body.username || !req.body.email || !req.body.password || !req.body.name)
            res.status(400).json("enter all of the required fields please!");
        else{
            let encrypted = CryptoJS.AES.encrypt(req.body.password, process.env.secretKey);
            let now = new Date();
            const newUser = new userModel(
                nanoid(8),
                req.body.username,
                req.body.name,
                req.body.email,
                req.body.password,
                req.body.isAdmin, 
                moment(now)
            );
            const user = await session.run(`CREATE (u:User {_id : '${newUser.userId}', name: '${newUser.name}', username: '${newUser.username}', email: '${newUser.email}', password: '${encrypted.toString()}', isAdmin: '${newUser.isAdmin}', createdAt: '${newUser.createdAt}'} ) return u`)
            await session.run(`CREATE CONSTRAINT unique_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT unique_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE`);
            const accessToken = jwt.sign({
                id: user.records[0].get("u").properties._id,
                isAdmin: user.records[0].get("u").properties.isAdmin
            }, process.env.ACCESSSECRET, {expiresIn: "30m"})
            res.header('auth-token', accessToken)
            res.status(200).json(user.records[0].get("u").properties);
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

auth.post('/Login', async (req, res) => {
    try {
        if(!req.body.username || !req.body.password)
            res.status(400).json("enter all of the required date please!");
        else{
            const user = await session.run(`MATCH (u:User {username : '${req.body.username}'} ) return u limit 1`);
            if(user.records.map(i=>i.get("u").properties).length == 0)
                res.status(401).json("This user doesn't exist");
            else if(CryptoJS.AES.decrypt(user.records[0].get("u").properties.password, process.env.secretKey).toString(CryptoJS.enc.Utf8) != req.body.password)
                res.status(500).json("Password is incorrect");
            else{
                const {password, ...others} = user.records[0].get("u").properties;
                const accessToken = jwt.sign({
                    id: user.records[0].get("u").properties._id,
                    isAdmin: user.records[0].get("u").properties.isAdmin
                }, process.env.ACCESSSECRET, {expiresIn: "30m"})
                const refreshToken = jwt.sign({
                    id: user.records[0].get("u").properties._id,
                    isAdmin: user.records[0].get("u").properties.isAdmin
                }, process.env.REFRESHTOKEN)
                res.header('auth-token', accessToken)
                res.header('auth-refresh-token', refreshToken)
                res.status(200).json({others, accessToken, refreshToken})
            }
        }
    } catch (error) {
        res.status(500).json(error);
        console.log(error)
    }
})

export default auth;