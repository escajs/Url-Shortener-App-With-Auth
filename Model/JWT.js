const { json } = require('express')
const {sign,verify} = require('jsonwebtoken')
const mongoose = require('mongoose')
const userModel = require('./_RawURI')
const createTokens = user =>{
    const accessToken = sign({
        username : user['USERNAME'],
        id :user['_id']
    },'jwtkey')
    return accessToken
}

const validateToken = (req,res,next)=>{
    const availableToken = req.cookies['access-token']
    const outToken = req.cookies['6yfdout']
    if(!(availableToken && outToken)) res.status(400).send('Sorry, You are not authorized to access this page.')
    try{
        const validToken = verify(availableToken,'jwtkey')
        if(validToken && outToken) {
            //if user has token ; middleware will use next and wont cut the requested ressource
            // next is the : DAM
            req.currentUser = validToken
            next()
        }
    }catch(err){
        res.json({mssg : err})
    }
}

const validateTokenForNewLink = (req,res,next)=>{
    const availableToken = req.cookies['access-token']
    const outToken = req.cookies['6yfdout']
    try{
        const validToken = verify(availableToken,'jwtkey')
        if(outToken){
            req.CURRENTUSER = validToken
            req.auth = true
        }else{
            req.auth = false
        }
    }finally{next()}
}

const homeToken = (req,res,next) =>{
    const availableToken = req.cookies['access-token']
    const outToken = req.cookies['6yfdout']
    try{
        const token = verify(availableToken,'jwtkey')
        if(token && outToken ) req.authenticated=true
        else req.authenticated=false
    }finally{
        next()
    }
}
module.exports = {createTokens,validateToken,validateTokenForNewLink,homeToken}