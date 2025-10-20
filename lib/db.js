// Database Connection Utility
import pkg from 'pg';
const { Pool, Client } = pkg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database connection class
class Database {
  constructor() {
    this.pool = pool;
  }

  // Execute query with parameters
  async query(text, params = []) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.SHOW_QUERY_LOG === 'true') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }
      
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Get a client from the pool
  async getClient() {
    return await this.pool.connect();
  }

  // Execute transaction
  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Test connection
  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      return {
        success: true,
        message: 'Database connected successfully',
        timestamp: result.rows[0].current_time
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  // Get database stats
  async getStats() {
    try {
      const result = await this.query('SELECT * FROM dashboard_stats');
      return result.rows[0];
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  // Close all connections
  async close() {
    await this.pool.end();
  }
}

// Create singleton instance
const db = new Database();

// Export database instance and pool
export default db;
export { pool, Database };

// Test connection on startup
if (process.env.NODE_ENV === 'development') {
  db.testConnection().then(result => {
    if (result.success) {
      console.log('✅ Database connected:', result.timestamp);
    } else {
      console.error('❌ Database connection failed:', result.error);
    }
  });
}