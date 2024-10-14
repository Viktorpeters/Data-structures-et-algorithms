const jwt = require('jsonwebtoken');


const generateTokenAndSetCookie = (res, userId) => {
    // generates a token
    const token = jwt.sign({userId}, process.env.JWT_SECRET , {
        expiresIn: '1d'
    })

    // sets the token on the client side alongside its properties
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 24 * 60 * 60 * 1000
    })
    
    // return the token
    return token
}


module.exports = generateTokenAndSetCookie