// Simple development server starter
process.env.DATABASE_URL = 'postgresql://postgres:heYYuspBVAXInkpFZucJkbWOuDwLHWLB@switchback.proxy.rlwy.net:23851/railway';
process.env.JWT_SECRET = 'rahasia_super_aman';
process.env.PORT = '5000';

// Start the server
require('./server.js');
