const express = require('express');
const db = require('./data/dbConfig')
const bcrypt = require('bcryptjs')
const server = express();
server.use(express.json())

// server.get('/api/users', (req, res) => {

// })

// Returns id of newly-created user
server.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  let user = { username, password}
  user.password = bcrypt.hashSync(password, 10);
  console.log(user)
  db('users').insert(user)
    .then(data => {
      console.log(data)
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err)
    })
})

module.exports = server