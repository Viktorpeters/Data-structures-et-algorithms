const jwt = require('jsonwebtoken')

exports.verifyUser = (req, res, next) => {

    // check if the request has a token
    const token = req.cookies.token;

    if (!token) return res.status(401).json({success: false, message: 'unauthorized - no token provided'})

    try {

        // if token exists, proceed to verify it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // if not decoded , because of an already tampered signature
        if (!decoded) return res.status(401).json({success: false, message: 'unauthorized - invalid token'});
        
        // if data exists on the decoded
        req.userId = decoded.userId
        next()

    } catch(error) {

        console.log('error in verfiying token')

        return res.status(500).json({success: false, message: 'Server Error'})

    }

}
