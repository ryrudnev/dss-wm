const config = {
  env: process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: '0.0.0.0',
  server_port: process.env.PORT || 1337,

  // ----------------------------------
  // Stardog platform Configuration
  // ----------------------------------
  stardog_endpoint: 'http://localhost:5820/',
  stardog_credentials: ['admin', 'admin'],
};

export default config;
