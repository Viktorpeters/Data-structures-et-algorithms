const express = require('express')
const dotenv = require('dotenv')
const app = express()
const authRouter = require('./routes/authRoute')
const { connectDb } = require('./db/connectDb')
const cookieParser = require('cookie-parser')
const { verifyUser } = require('./MiddleWare/verifyToken')
const User = require('./models/Users')

dotenv.config()

// check for authentication

app.get('/checkauth', verifyUser, async (req, res) => {
    try {
        // find user with the userId , from the request object

        const user = await User.findById(req.userId)

        // if user does not exist
        if (!user)
            return res
                .status(400)
                .json({ success: false, message: 'User not found' })

        res.status(200).json({
            success: true,
            message: 'User found',
            user: {
                ...user,
                password: undefined,
            },
        })
    } catch (error) {
        console.log('error in checking auth')
        res.status(400).json({ success: false, message: error.message })
    }
})

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)

connectDb((client) => {
    app.listen(process.env.PORT, (req, res) => {
        console.log('listening on port 3000')
    })
})
