const express = require('express');
const db = require('./data/dbConfig')
const bcrypt = require('bcryptjs')
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session)
const server = express();

const sessionConfig = {
  name: "name",
  secret: "secret",
  cookies: {
    maxAge: 1000 * 60 * 15, // ms
    secure: false //used over https only
  },
  httpOnly: true, //can the user access the cookie from js
  resave: false,
  saveOninitialized: false, // GDPR laws against setting cookies automatically
  store: new KnexSessionStore({
    knex: db,
    tablename: "sessions",
    sidFieldname: "sid",
    createTable: true,
    clearInterval: 1000 * 60 * 60 //ms
  })
};

server.use(express.json())
server.use(session(sessionConfig));

async function add(user) {
  const [id] = await db('users').insert(user);

  return findById(id)
}

function findBy(filter) {
  return db('users').where(filter);
}

function findById(id) {
  return db('users').where('user_id', '=', id).first();
}



// Returns id of newly-created user
server.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  let user = { username, password}
  user.password = bcrypt.hashSync(password, 10);
  if (username && password)
  add(user)
    .then(data => {
      console.log(data)
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err)
    })
})

// POST
server.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if(username, password) {
    db('users').where({username}).first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.username = user.username
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'You shall not pass' });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    })
  } else {
    res.status(400).json({ message: "Unexpected arguments" });
  }
})

function restricted(req, res, next) {
  if (req.session && req.session.username) {
    next();
  } else {
    res.status(401).json({ message: "You shall not pass!" });
  }
}

server.get('/api/users', restricted, (req, res) => {
  db('users')
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ message: "Server error", error });
    });
});

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.json({ error });
      } else {
        res.status(200).json({ message: "Successfull logout" });
      }
    });
  } else {
    res.end();
  }
});

module.exports = server