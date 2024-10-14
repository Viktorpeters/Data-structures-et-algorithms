const mongoose = require('mongoose');
const express = require('express')
const app = express();


exports.connectDb = async function(cb) {
    try {
        console.log(process.env.MONGO_URL)
        const client = await mongoose.connect(process.env.MONGO_URL);

        cb(client)
    } catch(err) {
        console.log(err)
        console.log('cant connect to the database')
    }
}