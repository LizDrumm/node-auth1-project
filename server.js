const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// we will bring bcrypt onboard
const bcrypt = require('bcryptjs');
const session = require ('express-session');
const sessionStore = require('connect-session-knex')(session)


const usersRouter = require("./users/users-router");

const server = express();


server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(session({
    name: 'monkey', // the cookie is encrypted
    secret: 'this should come from process.env',
    cookie: {
        maxAge: 1000 * 60,
        secure: false, // in production set to true (https is a must)
        httpOnly: true // this means the JS on the page cannot read the cookie
    },
    resave: false,
    saveUninitialized: false, // we don't want to persist the session 'by default'
    store: new sessionStore ({
        knex: require('./database/connection'),
        tablename: 'sessions',
        sessionidfieldname: 'sid', //session id field name (column name for storing sessions)
        createTable: true,
        clearInterval: 1000 * 60 * 60 //time in which all sessions will be purged from the table
    })
}));


server.use("/users", usersRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});


module.exports = server;