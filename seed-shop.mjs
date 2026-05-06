import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'gateway06.us-east-1.prod.aws.tidbcloud.com',
  user: 'qNVXiJf3ocKecDP.root',
  password: 'wBjd68Cprd7Dyg8eNX69',
  database: 'ToqkzfRPYvXNVqdGPxri2k',
  ssl: { rejectUnauthorized: true }
});

const shopItems = [
  // MLBB Diamond
  { name: 'MLBB 100 Diamonds', game: 'MLBB', description: 'Mobile Legends Bang Bang 100 Diamonds', energyCorePrice: 50, category: 'MLBB' },
  { name: 'MLBB 500 Diamonds', game: 'MLBB', description: 'Mobile Legends Bang Bang 500 Diamonds', energyCorePrice: 200, category: 'MLBB' },
  { name: 'MLBB 1000 Diamonds', game: 'MLBB', description: 'Mobile Legends Bang Bang 1000 Diamonds', energyCorePrice: 350, category: 'MLBB' },
  
  // PUBG UC
  { name: 'PUBG 100 UC', game: 'PUBG', description: 'PUBG Mobile 100 Unknown Cash', energyCorePrice: 60, category: 'PUBG' },
  { name: 'PUBG 500 UC', game: 'PUBG', description: 'PUBG Mobile 500 Unknown Cash', energyCorePrice: 250, category: 'PUBG' },
  { name: 'PUBG 1000 UC', game: 'PUBG', description: 'PUBG Mobile 1000 Unknown Cash', energyCorePrice: 400, category: 'PUBG' },
  
  // Telegram Premium
  { name: 'Telegram Premium 1 Month', game: 'Telegram', description: 'Telegram Premium Subscription 1 Month', energyCorePrice: 150, category: 'Telegram' },
  { name: 'Telegram Premium 3 Months', game: 'Telegram', description: 'Telegram Premium Subscription 3 Months', energyCorePrice: 400, category: 'Telegram' },
  
  // Honor of Kings
  { name: 'HOK 100 Vouchers', game: 'HOK', description: 'Honor of Kings 100 Vouchers', energyCorePrice: 55, category: 'HOK' },
  { name: 'HOK 500 Vouchers', game: 'HOK', description: 'Honor of Kings 500 Vouchers', energyCorePrice: 220, category: 'HOK' },
  
  // Arena Breakout
  { name: 'Arena Breakout 100 Coins', game: 'ArenaBreakout', description: 'Arena Breakout 100 Coins', energyCorePrice: 45, category: 'ArenaBreakout' },
  { name: 'Arena Breakout 500 Coins', game: 'ArenaBreakout', description: 'Arena Breakout 500 Coins', energyCorePrice: 180, category: 'ArenaBreakout' },
  
  // Free Fire
  { name: 'Free Fire 100 Diamonds', game: 'FreeFire', description: 'Free Fire 100 Diamonds', energyCorePrice: 40, category: 'FreeFire' },
  { name: 'Free Fire 500 Diamonds', game: 'FreeFire', description: 'Free Fire 500 Diamonds', energyCorePrice: 170, category: 'FreeFire' },
];

try {
  for (const item of shopItems) {
    await connection.execute(
      'INSERT INTO shopItems (name, game, description, energyCorePrice, category, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())',
      [item.name, item.game, item.description, item.energyCorePrice, item.category]
    );
  }
  console.log('✅ Shop items seeded successfully!');
} catch (error) {
  console.error('❌ Error seeding shop items:', error);
} finally {
  await connection.end();
}
