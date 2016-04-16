const config = {
  // ----------------------------------
  // Stardog platform Configuration
  // ----------------------------------
  stardog_endpoint: process.env.STARDOG_ENDPOINT || 'http://localhost:5820/',
  stardog_credentials: ['admin', 'admin'],
  stardog_db: process.env.STARDOG_DB || 'wm-test',
};

export default config;
