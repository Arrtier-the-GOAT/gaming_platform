import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'gaming_platform',
});

try {
  // Check if mykBalance column exists
  const [columns] = await connection.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='mykBalance'"
  );
  
  if (columns.length === 0) {
    console.log('Adding mykBalance column...');
    await connection.execute(
      'ALTER TABLE `users` ADD COLUMN `mykBalance` int DEFAULT 0 NOT NULL'
    );
    console.log('✅ mykBalance column added successfully');
  } else {
    console.log('✅ mykBalance column already exists');
  }
  
  // Check if energyCoreBalance column exists and remove it
  const [ecColumns] = await connection.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='energyCoreBalance'"
  );
  
  if (ecColumns.length > 0) {
    console.log('Removing energyCoreBalance column...');
    await connection.execute(
      'ALTER TABLE `users` DROP COLUMN `energyCoreBalance`'
    );
    console.log('✅ energyCoreBalance column removed');
  }
  
  console.log('✅ Schema migration completed successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
