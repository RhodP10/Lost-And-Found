import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('Initializing database...');

  // Create connection without database selected
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'password',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    multipleStatements: true
  });

  try {
    // Read SQL file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute SQL
    console.log('Executing SQL schema...');
    await connection.query(schemaSql);

    console.log('Database initialized successfully!');

    // Insert sample data if needed
    if (process.argv.includes('--with-sample-data')) {
      console.log('Adding sample data...');
      await addSampleData(connection);
      console.log('Sample data added successfully!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

async function addSampleData(connection) {
  // Use the database
  await connection.query('USE lost_and_found');

  // Sample lost items
  const lostItems = [
    {
      title: 'Blue Backpack',
      description: 'Lost my blue North Face backpack with laptop inside. Last seen in the library.',
      category: 'Bags',
      status: 'lost',
      location: 'University Library',
      reporter_name: 'John Smith',
      reporter_email: 'john@example.com',
      reporter_phone: '555-123-4567'
    },
    {
      title: 'iPhone 13 Pro',
      description: 'Lost my iPhone 13 Pro with a black case. The lock screen has a picture of a dog.',
      category: 'Electronics',
      status: 'lost',
      location: 'Downtown Coffee Shop',
      reporter_name: 'Emily Johnson',
      reporter_email: 'emily@example.com'
    },
    {
      title: 'Car Keys',
      description: 'Lost my Toyota car keys with a red keychain.',
      category: 'Keys',
      status: 'lost',
      location: 'Central Park',
      reporter_name: 'Michael Brown',
      reporter_email: 'michael@example.com',
      reporter_phone: '555-987-6543'
    }
  ];

  // Sample found items
  const foundItems = [
    {
      title: 'Black Wallet',
      description: 'Found a black leather wallet with ID and credit cards inside.',
      category: 'Accessories',
      status: 'found',
      location: 'Bus Stop on Main Street',
      reporter_name: 'Sarah Wilson',
      reporter_email: 'sarah@example.com'
    },
    {
      title: 'Prescription Glasses',
      description: 'Found a pair of prescription glasses with tortoise shell frames.',
      category: 'Accessories',
      status: 'found',
      location: 'City Park',
      reporter_name: 'David Lee',
      reporter_email: 'david@example.com',
      reporter_phone: '555-456-7890'
    },
    {
      title: 'Textbook',
      description: 'Found a calculus textbook with the name "Jessica" written inside.',
      category: 'Other',
      status: 'found',
      location: 'Science Building',
      reporter_name: 'Robert Taylor',
      reporter_email: 'robert@example.com'
    }
  ];

  // Insert lost items
  for (const item of lostItems) {
    await connection.query(
      `INSERT INTO items (
        title, description, category, status, location,
        reporter_name, reporter_email, reporter_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.title,
        item.description,
        item.category,
        item.status,
        item.location,
        item.reporter_name,
        item.reporter_email,
        item.reporter_phone || null
      ]
    );
  }

  // Insert found items
  for (const item of foundItems) {
    await connection.query(
      `INSERT INTO items (
        title, description, category, status, location,
        reporter_name, reporter_email, reporter_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.title,
        item.description,
        item.category,
        item.status,
        item.location,
        item.reporter_name,
        item.reporter_email,
        item.reporter_phone || null
      ]
    );
  }
}

// Run the initialization
initializeDatabase();
