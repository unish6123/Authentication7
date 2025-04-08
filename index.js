const express = require('express');       // load express module
const nedb = require("nedb-promises");    // load nedb module
const bcrypt = require('bcrypt')

const app = express();                    // init app
const db = nedb.create('users.jsonl');    // init db
const crypto = require('crypto');          // load crypto module

app.use(express.static('public'));        // enable static routing to "./public" folder

//TODO:
// automatically decode all requests from JSON and encode all responses into JSON
app.use(express.json());                // decode JSON requests







const SALT_ROUNDS = 10




//TODO:
// create route to get all user records (GET /users)
//   use db.find to get the records, then send them
//   use .catch(error=>res.send({error})) to catch and send errors
app.get('/users',(req,res)=>{
    db.find({}).then(records=>res.send(records)).catch(error=>res.send({error}));
});



//TODO:
// create route to get user record (GET /users/:username)
//   use db.findOne to get user record
//     if record is found, send it
//     otherwise, send {error:'Username not found.'}
//   use .catch(error=>res.send({error})) to catch and send other errors
app.post('/users/auth',async(req,res)=>{
    
    const {username, password} = req.body;

    await db.findOne({username:username}).then(doc=>{
        if (!doc){
            return res.send({error:'Username not found.'});
        }
        const hashedPassword = doc.password;
       

        const matched = bcrypt.compareSync(password, hashedPassword);
        res.json({match: matched, authenticationToken:doc.authToken});
        console.log(matched);

        
    }).catch(error=>res.json({error}));
});

//TODO:
// create route to register user (POST /users)
//   ensure all fields (username, password, email, name) are specified; if not, send {error:'Missing fields.'}
//   use findOne to check if username already exists in db
//     if username exists, send {error:'Username already exists.'}
//     otherwise,
//       use insertOne to add document to database
//       if all goes well, send returned document
//   use .catch(error=>res.send({error})) to catch and send other errors

app.post('/users/register',async(req,res)=>{
    // check if all fields are specified
    const {username, password, email, name} = req.body;
    if(!username || !password || !email || !name){
        res.send({error:"Missing fields."});
        return;
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    req.body.password = hashedPassword;

    const authToken = crypto.randomBytes(32).toString('hex');
    req.body.authToken = authToken;
    
    db.findOne({username:username}).then(doc=>{
        if(doc) res.send({error:'Username already exists.'});
        else {
            // add document to database



            db.insert(req.body).then(doc=>res.send({authToken: authToken})).catch(error=>res.send({error}));
        }
    }).catch(error=>res.send({error}));
});


//TODO:
// create route to update user doc (PATCH /users/:username)
//   use updateOne to update document in database
//     updateOne resolves to 0 if no records were updated, or 1 if record was updated
//     if 0 records were updated, send {error:'Something went wrong.'}
//     otherwise, send {ok:true}
//   use .catch(error=>res.send({error})) to catch and send other errors

app.patch('/users/update', (req, res) => {
    
    const {username, email,token,name} = req.body;

    db.findOne({ username })
        .then(doc => {
            if (!doc) {
                return res.send({ error: 'Username not found.' });
            }
            
            if (doc.authToken !== token){
                return res.send({message : "You are not authorized to update this user."});
            }
            if (doc.authToken === token){
                db.update({ username }, { $set: {name:name, email:email} })
                .then(updatedCount => {
                    if (updatedCount === 0) {
                        res.send({ error: 'Could not insert to the database.' });
                    } else {
                        res.send({ ok: true });
                    }
                })
                .catch(error => res.send({ error }));
            }
    
        })

    
});


//TODO:
// create route to delete user doc (DELETE /users/:username)
//   use deleteOne to update document in database
//     deleteOne resolves to 0 if no records were deleted, or 1 if record was deleted
//     if 0 records were deleted, send {error:'Something went wrong.'}
//     otherwise, send {ok:true}
//   use .catch(error=>res.send({error})) to catch and send other errors

app.delete('/users/:username/:authenticationToken',(req,res)=>{
    const { username, authenticationToken} = req.params;
    db.findOne({username:username})
        .then(doc=>{
            if (!doc) {
                return res.send({ error: 'Username not found.' });
            }
            if (authenticationToken !==  doc.authToken ){
                return res.send({message : "You are not authorized to delete this user."});
            }
        })
    db.deleteOne({ username })
        .then(deletedCount => {
            if (deletedCount === 0) {
                res.send({ error: 'Could not delete from the database.' });
            } else {
                res.send({ ok: true });
            }
        })
        .catch(error => res.send({ error }));   
})

app.post('/userInfo', (req, res) => {
    const { authToken } = req.body;
    db.findOne({authToken})
        .then(doc => {
            if (doc) {
                res.send({username: doc.username, email: doc.email, name: doc.name});
            } else {
                res.send({ error: 'Invalid auth token.' });
            }
        })
        .catch(error => res.send({ error }));
});``

// default route
app.all('*',(req,res)=>{res.status(404).send('Invalid URL.')});

// start server
app.listen(3000,()=>console.log("Server started on http://localhost:3000"));
