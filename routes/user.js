import { Router } from 'express';
import dotenv from 'dotenv/config'
import session from '../index.js';
import CryptoJS from 'crypto-js';
import {verifyTokenAuthorization, verifyToken, verifyTokenAdmin} from './verifyToken.js'

const user = Router();

user.put('/:id',verifyToken , async (req, res) => {
    try {
        let checkUpdate = false
        const user = await session.run(`MATCH (u:User {_id : '${req.params.id}'} ) return u limit 1`)
        if(user.records.length != 0){
            if(req.body.username){
                await session.run(`MATCH (u:User {_id : '${req.params.id}'} ) SET u.username = '${req.body.username}' return u limit 1`)
                checkUpdate = true
            }
            if(req.body.password){
                req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.secretKey).toString();
                await session.run(`MATCH (u:User {_id : '${req.params.id}'} ) SET u.password = '${req.body.password}' return u limit 1`)
                checkUpdate = true
            }
            if(checkUpdate){
                res.status(200).json("updated witth success")
            }
        }
        else{
            res.status(400).json("this user doesn't exist");
        }
    } catch (error) {
        console.log(error)
    }
})

user.get('/userdata' ,verifyTokenAdmin , async (req, res) => {
    try {
        const user = await session.run(`MATCH (u:User {username : '${req.body.username}'} ) return u limit 1`)
        if(user.records.map(i=>i.get("u").properties).length == 0)
            res.status(400).json("this user doesn't exist")
        else{
            const { password, ...others } = user.records[0].get("u").properties
            res.status(200).json(others)
        }
    } catch (error) {
        console.log(error)
    }
})

user.get('/allusers' ,verifyTokenAdmin , async (req, res) => {
    try {
        if(!req.body.username)
            res.status(400).json("you must provide a username")
        else{
            const users = await session.run(`MATCH (u:User) WHERE u.username CONTAINS '${req.body.username}' return u`)
            const user = users.records.map(i=>i.get("u").properties)
            res.status(200).json(user)
        }
    } catch (error) {
        console.log(error)
    }
})

user.get('/stats/month', verifyTokenAdmin, async (req, res) => {
    try {
        const user = await session.run(`match (user:User) return split(user.createdAt," ")[1] as months, count(user.username) as total `);
        const userPerMonthObj = {}
        for (let i = 0; i < user.records.length; i++) {
            userPerMonthObj[user.records.map(i=>i.get("months"))[i]] = user.records.map(i=>i.get("total"))[i].low
        }
        res.send(userPerMonthObj)
    } catch (error) {
        console.log(error)
    }
})

user.get('/stats/year',verifyTokenAdmin, async (req, res) => {
    try {
        const user = await session.run(`match (user:User) return split(user.createdAt," ")[3] as year, count(user.username) as total `);
        const userPerYearObj = {}
        for (let i = 0; i < user.records.length; i++) {
            userPerYearObj[user.records.map(i=>i.get("year"))[i]] = user.records.map(i=>i.get("total"))[i].low
        }
        res.send(userPerYearObj)
    } catch (error) {
        console.log(error)
    }
})

export default user;