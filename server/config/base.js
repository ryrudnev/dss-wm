export default {
  // Server side options
  server: {
    port: process.env.PORT || 1337,
  },
  // Options for stardog platform
  stardog: {
    // Default db on stardog platform
    dbName: 'wm',
    // Default prefix of db
    dbPrefix: 'http://localhost/owl/wm#',
    endpoint: 'http://localhost:5820/',
    // as [username, password]
    credentials: ['admin', 'admin'],
  },
};
