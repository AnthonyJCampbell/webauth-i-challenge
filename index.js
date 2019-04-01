const server = require('./server')

const port = 3030;
server.listen(port, () => console.log(`server listening on port ${port}`))