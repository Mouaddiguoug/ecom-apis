import jwt from 'jsonwebtoken';
import dotenv from 'dotenv/config'

export const verifyToken = (req, res, next) => {
    const token = req.header("auth-token");
    if(!token) 
        res.status(401).send("Access denied");
    try {
        const verified = jwt.verify(token, process.env.ACCESSSECRET)
        req.user = verified
        next()
    } catch (error) {
        res.status(400).send("invalid token")
    }
}

export const verifyTokenAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id || req.user.isAdmin)
            next(); 
        else
            res.status(403).json("Access denied")
    })
}

export const verifyTokenAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin){
            next();
        }
        else
            res.status(403).json("you are not an admin")
    })
}
