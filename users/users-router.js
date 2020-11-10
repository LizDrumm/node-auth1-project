const router = require("express").Router();

const Users = require("./users-model");

const bcrypt = require('bcryptjs');



// [POST] register and login (we need to send paylod - req.body)
router.post('/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;//used to get data from the post request
      // do the hash, add the hash to the db
      const hash = bcrypt.hashSync(password, 10); // 2 ^ 10 rounds of hashing
      // we will insert a record WITHOUT the raw password
      const user = { username, password: hash };
      const addedUser = await Users.add(user);
      res.json(addedUser);
    } catch (err) {
      // res.status(500).json({ message: 'Something went terrible' }) // PRODUCTION
      res.status(500).json({ message: err.message })
    }
  })
  
router.post('/auth/login', async (req, res) => {
    // checks whether credentials legit
    try {
      // 1- use the req.username to find in the db the user with said username 
      // 2- compare the bcrypt has of the user we just pulled against req.body.password
      const [user] = await Users.findBy({ username: req.body.username })
      if (user && bcrypt.compareSync(req.body.password, user.password)){
        console.log(user)
        //3- if user and credentials good then welcome message
        req.session.user = user
        res.json({message:`welcome ${user.username}`})
      }else{
        // 4- if no user, send back a failure message
        // 5- if user but credentials bad send packing
        res.status(401).json({message:'bad credentials'})
      }
      
    } catch (err) {
      //res.status(500).json({})
      res.status(500).json({ message: err.message })
    }
  })
  



  // [GET] logout no need for req.body
router.get('/auth/logout', (req, res) => {
  if (req.session && req.session.user){
    //we need to destroy the session
    req.session.destroy (err=>{
      if (err) res.json({message:' you can not leave'})
      else res.json({message: 'later!!!'})
    })
  } else{
    res.json({message:' you had no session actually!'})
  }
  })




//MiddleWare


function secure(req, res, next) {
    // check if there is a user in the session
    if (req.session && req.session.user) {
      next()
    } else {
      res.status(401).json({ message: 'Unauthorized!' })
    }
  }

  router.get("/",secure, (req, res) => {
    Users.find()
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => res.send(err));
  });














module.exports = router;