import hapi from 'joi';

export const registerValidation = (req) =>{
    const schema = hapi.object().keys({
        username: hapi.string().min(8),
        email: hapi.string().email({ tlds: { allow: ['com', 'net'] } }),
        password: hapi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
    })
    return schema.validate({username: req.body.username, email: req.body.email, password: req.body.password});
}
