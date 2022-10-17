import Express from "express";
import dotenv from 'dotenv/config';
import neo4j from 'neo4j-driver';
import userRouter from './routes/user.js'
import authRouter from './routes/auth.js'
import orderRouter from './routes/order.js';
import productRouter from './routes/product.js';
import cardRouter from './routes/cards.js';
import express from "express";

const {
    database,
    db_username,
    password,
    url
} = process.env;

const driver = neo4j.driver(url, neo4j.auth.basic(db_username, password));

const session = driver.session({database});

const app = Express();

app.use(express.static("./images"));

app.use(Express.json());

app.use(express.urlencoded({extended: false}));

app.use("/api/auth", authRouter);
app.use('/api/order', orderRouter);
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/card", cardRouter);

app.listen(process.env.PORT, () => console.log("server runnning on: http://localhost:" + process.env.PORT));

export default session;