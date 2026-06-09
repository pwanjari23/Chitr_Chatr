import mysql from 'mysql2/promise';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
  const dbName = process.env.DB_NAME || 'chat_application';
  console.log(`Starting MySQL and Sequelize diagnostic verification...`);
  console.log(`Database Target: ${dbName}`);
  console.log(`Host: ${process.env.DB_HOST || '127.0.0.1'}`);
  console.log(`User: ${process.env.DB_USER || 'root'}`);

  try {
    // 1. Raw MySQL Server connection check
    console.log('\nChecking raw MySQL Server connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });
    console.log('✔ Connected to MySQL server successfully.');
    
    // Auto generate database if missing
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✔ Checked/Created database \`${dbName}\` successfully.`);
    await connection.end();

    // 2. Sequelize auth check
    console.log('\nChecking Sequelize connection pool...');
    await sequelize.authenticate();
    console.log('✔ Sequelize connection has been verified successfully.');

    // 3. Test sync models
    console.log('\nSyncing Sequelize models with tables...');
    await sequelize.sync({ force: false });
    console.log('✔ All models synchronized with database successfully.');

    console.log('\n🎉 DIAGNOSTICS SUCCESSFUL: MySQL connection is fully operational.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DIAGNOSTICS FAILED: Unable to establish database connection.');
    console.error('Details:', error.message || error);
    console.error('\nPlease check that:');
    console.error('1. Your MySQL Server is running (MySQL80 service is active).');
    console.error('2. Your credentials in server/.env match your MySQL password.');
    process.exit(1);
  }
};

testConnection();
