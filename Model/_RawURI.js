const mongoose = require('mongoose')
const urlSchema = new mongoose.Schema({
    LONGURL : {
        type : String , 
        required : true,
        lowercase : true
    },
    SHORTURL : {
        type : String,
        unique: true,
        required: true,
    }
})

const userSchema = new mongoose.Schema({
    EMAIL : {
        type : String,
        lowercase: true,
        unique: true,
        required : true
    },
    USERNAME : {
        type : String,
        required : true,
        unique : true
    },
    PASSWORD : {
        type : String,
        required : true
    },
    USERURLS : [urlSchema]
})

module.exports = mongoose.model('rawUrlCollection',userSchema)