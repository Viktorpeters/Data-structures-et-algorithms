const express = require('express');
const authRouter = express.Router();
const User = require('../models/Users');
const bycryptjs = require('bcryptjs');
const getVerificationCode = require('../Utils/getVerificationCode');
const generateTokenAndSetCookie = require('../Utils/generateTokenAndSetCookie');
const {MailTrapClient, verifyMail, welcomeMail, forgotPassword, resetSuccessful} = require('../Emails/email');
const crypto = require('crypto')




// POST REQUEST => /signup
authRouter.post('/signup', async (req, res) => {
    console.log('got here')
    // Get user details from the body
    const {email, password, name} = req.body

    // set up a try catch block
    try {

        if (!email || !password || !name) {
            // throw an error
            throw new Error('All Fields are required');
        }
    
        // if the above is passed, proceed to check if the user name is already taken.
        const userAlreadyExists = await User.findOne({email});
    
        if (userAlreadyExists){
            // send a response to the user that email has already been taken
            return res.status(400).json({
                message: 'User already taken',
                success: false,
            });
        }
    
        // no user already exists, proceed to hash the password
        const hashedPassword = await bycryptjs.hash(password, 10);

        const verificationCode = getVerificationCode();

        // create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken: verificationCode,
            verficationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })

        // create user on the database 
        await newUser.save()

        // set up the jwt token and also save it on the response
        generateTokenAndSetCookie(res, newUser._id);


        // send a susceful response to the client
        res.status(201).json({
            success: true,
            message: 'User created succesfully',
            user: {
                ...newUser._doc,
                password: undefined
            }
        })

        // send verification code to the user
        verifyMail(MailTrapClient, name, verificationCode)

    } catch (err){
        console.log(err.message)
    }

})

// POST REQUEST /verifymail
authRouter.post('/verifymail', async (req, res) => {

    const {code} = req.body;

    console.log(code)


    // check of any user that has this code at is verficationCode
    
    const user = await User.findOne({verificationToken: code, verficationTokenExpiresAt: {$gt: Date.now()}})

    console.log(user)
    // if user does not exists with the verfication code send a failure response 

    if (!user) {

        return res.status(400).json({
            message: 'invalid verfication code'
        })
    }


    // if found send a successful response and also change some properties of the found user  ---- isVerified --- password 

    user.isVerified = true;

    await user.save();


    // send a confirmation email that account has been created succesfully

    welcomeMail(MailTrapClient, user.name, 'Maria Curie')



    return res.status(200).json({
        message: 'user created succesfully',
        user: {
            ...user._doc,
            password: undefined
        }
    })




});


// POST REQUEST /login
authRouter.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
            // verfiy if the a user with the email exist
            const user = await User.findOne({email: email})

            // from the user , extract the password and check is it is the same as the stored Hash 

            const isCorrect = await bycryptjs.compare(password, user.password);

            if (!user || !isCorrect){
                throw Error('Invalid Credentials')
            }

            console.log(user, isCorrect)

            // if correct proceed, generate JWT token on the response tied to the verified user
            generateTokenAndSetCookie(res, user._id)

            // update the last Login Date
            user.lastLogin = new Date();

            // save the user
            await user.save();

            // send a response to the user
            return res.status(400).json({
                sucess: true,
                message: "user logged in succesfully",
                user: {
                    ...user._doc,
                    password: undefined
                }
            })


    } catch(err) {
        console.log(err, err.message)

        // send a response to the client

        res.status(400).json({
            message: err.message,
            sucess: false
        })
    }
})


// POST REQUEST /logout
authRouter.post('/logout', async (req, res) => {

    // destroy the cookie res.clearCookie(name of jwt), its a synchronous process

    res.clearCookie('token')

    // return a response 
    return res.status(200).json({
        success: true,
        message: 'user loggedout sucessfully'
    })

})


// POST REQUEST /forgotpassword
authRouter.post('/forgotpassword', async (req, res) => {

    try {

        // get the email from the password field
        const {email} = req.body

        // confirm if the email exists on the database
        const user = await User.findOne({email: email});

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email not found'
            })
        }

        // if yes , generate a random token , with the crypto package
        const resetToken = crypto.randomBytes(20).toString('hex')

        // update this token on the user and also its expiry date
        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 60 * 1000

        // update the database
        await user.save()


        // send an email to reset the password

        await forgotPassword(MailTrapClient, 'alternative school', user.name, `http://localhost:5173/forgotpassword/${resetToken}`)

    }
    catch(error){
        console.log(error.message)
    }

});

// POST REQUEST /resetpassword/:token
authRouter.post('resetpassword/:token', async (req, res) => {

    // extract the url in a way 😆

    const {token} = req.params

    const {password} = req.body


    try {

        // check if the token exists
        const user = await User.findOne({resetPasswordToken: token, resetPasswordExpiresAt: {$gt: Date.now()}});
    
        if (!user) {
            // throw an error
            throw new Error('invalid token or expired')
        }

        // change the password on the server
        user.password = password

        // save the user 
        await user.save()

        console.log('password reset successfully')

        // send an email to the user

        await resetSuccessful(MailTrapClient, 'alternative school', user.name)


    } catch(error) {

        console.log(error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        })
    }

})



module.exports = authRouter;