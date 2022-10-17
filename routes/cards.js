import { Router } from 'express';
import session from '../index.js';
import { nanoid } from 'nanoid';
import moment from 'moment';
import {verifyTokenAuthorization, verifyToken} from './verifyToken.js'
import { verifyTokenAdmin } from './verifyToken.js';

const card = Router();

card.post("/", verifyToken, async (req, res) => {
    let now = Date(); 
    try {
        let card = await session.run(`MATCH (u:User {_id: "${req.body.userId}"}) create (c:Card {id: "57784", createdAt: "thu 15 mar"}) create (u) -[:has]-> (c) return c limit 1`)
        for (let i = 0; i < req.body.products.length; i++) {
            await session.run(`match (c:Card {id: '${card.records[0].get("c").properties.id}'}), (p:Product {id: "${req.body.products[i].productId}"}) create (c) -[:has {quantity: '${req.body.products[i].quantity}'}]-> (p) return c`)
        }
        res.status(200).json("card created with success")
    } catch (error) {
        console.log(error)
    }
})

card.get("/:userId", verifyToken, async (req, res) => {
    try {
        let card = await session.run(`match (c:Card), (u:User {_id: "${req.params.userId}"}) where (u) -[:has]-> (c) return c limit 1`)
        res.status(200).json(card.records[0].get("c").properties)
    } catch (error) {
        console.log(error)
    }
})

card.get("/all", verifyTokenAdmin, async (req, res) => {
    try {
        let card = await session.run(`match (c:Card) return c`)
        res.status(200).json(card.records.map(i=>i.get("c").properties))
    } catch (error) {
        console.log(error)
    }
})


export default card;