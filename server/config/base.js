export default {
  // Server side options
  server: {
    port: process.env.PORT || 1337,
  },
  // Options for stardog platform
  stardog: {
    defaultDb: 'wm',
    endpoint: 'http://localhost:5820/',
    // as [username, password]
    credentials: ['admin', 'admin'],
  },
};
