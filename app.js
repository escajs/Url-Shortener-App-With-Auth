// initialize global modules
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const userModel = require('./Model/_RawURI')
const {createTokens,validateToken,validateTokenForNewLink,homeToken} = require('./Model/JWT')
// set globql middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.set('view engine','ejs')
app.use(express.static('public'))
// Connect to DB & Listen to client - requests
mongoose.connect('mongodb://localhost/rawUrlsDB',{useUnifiedTopology:true,useNewUrlParser:true})
.then(_=>app.listen(2000))
.catch(connErr=>console.log(connErr))
// Application Endpoints
app.get('/',homeToken,(req,res)=>{
    res.render('index',{_status : req.authenticated})
})
app.get('/showusers',(req,res)=>{
    userModel.find()
    .then(docs=>res.json(docs))
})
app.get('/newUser',(req,res)=>{
    res.render('signup')
})
app.post('/newUser',(req,res)=>{
    userModel.findOne({USERNAME:req.body['_username']})
    .then(docs=>{
        if(!docs){
            const password = req.body['_userpass']
            bcrypt.hash(password,10)
            .then(hashedPass=>{
             const dummyUser = {
           EMAIL :req.body['_useremail'],
            USERNAME :req.body['_username'],
            PASSWORD : hashedPass
              }
        const newUser = new userModel(dummyUser)
        newUser.save()
        })
        .then(_=>res.json({mssg : 'User added'}))
        }else{
            res.send('User already exist')
        }
    })
})


app.get('/login',(req,res)=>{
    res.render('login')
})
app.post('/login',(req,res)=>{
    const searchTerm = req.body['_username_login']
    const passFront  = req.body['_userpass_login']
    userModel.findOne({USERNAME :searchTerm })
    .then(doc=>{
        if(!doc) res.status(400).json({mssg : 'Username is incorrect'})
        bcrypt.compare(passFront,doc['PASSWORD'])
        .then(match=>{
            if(!match) res.status(400).json({mssg: 'Incorroct Password'})
            // generate jwt token
            const ACCESSTOKEN = createTokens(doc)
            res.cookie('access-token',ACCESSTOKEN,{maxAge : 21600000 , httpOnly : true })
            res.cookie('6yfdout',true,{maxAge : 21600000 , httpOnly : false })
        }).then(_=> res.status(200).redirect('/dashboard'))
    })
})


app.post('/newLink',validateTokenForNewLink,(req,res)=>{
    let searchTerm
    if(req.auth) { 
        searchTerm = req.CURRENTUSER['username']
        userModel.findOne({USERNAME : searchTerm})
        .then(doc=>{
        let dummyLONGURL = req.body['_rawLink']
        let uniqeParam = Math.random().toString(36).substr(2,6)
        doc['USERURLS'].unshift({LONGURL : dummyLONGURL,SHORTURL:uniqeParam})
        doc.save()
    }).then(_=>res.status(200).redirect('/dashboard'))
    }
    else {res.redirect('/')}
})


app.get('/dashboard',validateToken,(req,res)=>{
    
    //console.log('from validate : ',req.currentUser)
    let SEARCHTERM =req.currentUser['username']
    userModel.findOne({USERNAME : SEARCHTERM})
    .then(doc=>{
        const LINKS = doc['USERURLS']
        res.render('dashboard',{links:LINKS,user: SEARCHTERM})
    })
})

app.get('/:rnmParam',(req,res)=>{
    userModel.find()
    .then(docs=>{
        let URLS=[]
        docs.forEach(url=>{URLS.push(url['USERURLS'])})
       for(let outerI of URLS){
           for(let innerI in outerI){
               let singleURLOBJECT = outerI[innerI]
                if(singleURLOBJECT['SHORTURL'] === req.params.rnmParam){
                    res.redirect(singleURLOBJECT['LONGURL'])
                    break
                }else{res.redirect('/')}
           }
       }
    })
})

