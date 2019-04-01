const express = require('express');
const db = require('./data/dbConfig')
const bcrypt = require('bcryptjs')
const server = express();
server.use(express.json())

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
  db('users').where({username}).first()
  .then(user => {
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ message: `Welcome ${user.username}!` });
    } else {
      res.status(401).json({ message: 'You shall not pass' });
    }
  })
  .catch(err => {
    res.status(500).json(err);
  })
})

module.exports = server