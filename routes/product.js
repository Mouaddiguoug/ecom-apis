import { Router } from 'express';
import session from '../index.js';
import productModel from '../models/products.js'; 
import moment from 'moment';
import {uploadimages} from '../multer.js';
import { nanoid } from 'nanoid';
import {verifyTokenAuthorization, verifyToken, verifyTokenAdmin} from './verifyToken.js'

const product = Router();

product.post('/',verifyTokenAdmin ,uploadimages , async (req, res) => {
    let now = new Date();
    try {
        const images = []
        if(!req.files){
            res.status(400).json("you must provide at least one picture!");
        }
        else if(!req.body.title || !req.body.desc || !req.body.categories || !req.body.size || !req.body.color || !req.body.price)
            res.status(400).json("you must provide all the required fields please!");
        else{
            req.files.img.map((image, i) => {
                images.push(image.destination)
            })
            const newProduct = new productModel(
                nanoid(8),
                req.body.title,
                req.body.desc,
                images,
                req.body.categories,
                req.body.size,
                req.body.color,
                req.body.price,
                moment(now)
            )
            const product = await session.run(`create (product:Product {id: '${newProduct.id}', title: '${newProduct.title}', desc: '${newProduct.desc}', images: '${newProduct.img}', categories: ${newProduct.categories}, size: '${newProduct.size}', colors: '${newProduct.color}', price: '${newProduct.price}', createdAt: '${newProduct.createdAt}' }) return product`);
            req.params.id = product.records.map(i=>i.get("product").identity.low)
            res.status(200).json(req.params.id);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
})

product.put('/:id', verifyTokenAdmin , async (req, res) => {
    let now = new Date();
    let check = false;
    try {
        if(req.body.title){
            const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) SET p.title = '${req.body.title}' return p limit 1`) 
            check = true
        }
        if(req.body.desc){
            const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) set p.desc = '${req.body.desc}' return p limit 1`) 
            check = true
        }
        if(req.body.categories){
            const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) set p.categories = '${req.body.categories}' return p limit 1`) 
            check = true
        }
        if(req.body.size){
            const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) set p.size = '${req.body.size}' return p limit 1`) 
            check = true
        }
        if(req.body.color){
            const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) set p.color = '${req.body.color}' return p limit 1`) 
            check = true
        }
        if(req.body.price){
            const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) set p.price = '${req.body.price}' return p limit 1`) 
            check = true
        }
        if(check)
            res.status(200).json("updated with success")
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

product.get('/:id', async (req, res) => {
    const prod = await session.run(`match (p:Product {id: '${req.params.id}'}) return p`) 
    res.status(200).json(prod.records[0].get("p").properties)
})

product.get("/", async (req, res) => {
    let qNew = req.query.new
    let qCategory = req.query.category
    if(qNew){
        const prod = await session.run(`match (p:Product) return p order by p.createdAt limit 5`) 
        res.status(200).json(prod.records.map(i=>i.get("p").properties))
    }
    else if(qCategory){
        const prod = await session.run(`match (p:Product) where any(item in p.categories where item = '${qCategory}') return p`) 
        res.status(200).json(prod.records.map(i=>i.get("p").properties))
    }
    else{
        const prod = await session.run(`match (p:Product) return p`) 
    }
})

export default product;