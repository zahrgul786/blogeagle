require('dotenv').config()
const mongoose = require('mongoose')
const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log('connect to db')
    } catch (error) {
         console.log(" not connect to db", error);
    }
}
module.exports = connectDb