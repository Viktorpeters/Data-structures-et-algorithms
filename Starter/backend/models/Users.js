const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    email : {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String || undefined,
    resetPasswordExpiresAt: Date || undefined,
    verificationToken: String || undefined,
    verficationTokenExpiresAt: Date || undefined
}, {timestamps: true});


const User = mongoose.model('users', userSchema);


module.exports = User;