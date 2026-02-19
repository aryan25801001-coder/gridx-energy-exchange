import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('🌱 Seeding GridX Demo Data...');

  try {
    // 1. Clear existing data (Careful: Order matters for FK)
    await query('DELETE FROM carbon_transactions');
    await query('DELETE FROM carbon_wallet');
    await query('DELETE FROM energy_trades');
    await query('DELETE FROM energy_production');
    await query('DELETE FROM houses');
    await query('DELETE FROM users');

    // 2. Create Users (2 Sellers, 3 Buyers)
    const users = [
      { id: uuidv4(), name: 'Arjun Sharma', email: 'arjun@example.com', role: 'seller', wallet: '0xE2515DAa133f915E80F9fA1A71658BF477382B21' },
      { id: uuidv4(), name: 'Priya Patel', email: 'priya@example.com', role: 'seller', wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
      { id: uuidv4(), name: 'Rohan Gupta', email: 'rohan@example.com', role: 'buyer', wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
      { id: uuidv4(), name: 'Ananya Iyer', email: 'ananya@example.com', role: 'buyer', wallet: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1' },
      { id: uuidv4(), name: 'Dev Singh', email: 'dev@example.com', role: 'buyer', wallet: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' },
    ];

    for (const user of users) {
      await query(
        'INSERT INTO users (id, name, email, role, wallet_address, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [user.id, user.name, user.email, user.role, user.wallet]
      );
      // Initialize carbon wallet
      await query(
        'INSERT INTO carbon_wallet (user_id, balance, total_earned, created_at) VALUES ($1, $2, $3, NOW())',
        [user.id, Math.random() * 500 + 100, Math.random() * 600 + 200]
      );
    }

    // 3. Create Houses
    const houses = [
      { id: uuidv4(), userId: users[0].id, name: 'SunVault Residency', address: 'Plot 42, Sector 5, Gurugram', capacity: 15.5 },
      { id: uuidv4(), userId: users[1].id, name: 'Solaris Eco-Farm', address: 'Village Badli, Haryana', capacity: 25.0 },
      { id: uuidv4(), userId: users[2].id, name: 'Smart Home A', address: 'Flat 101, Sky Towers', capacity: 5.2 },
      { id: uuidv4(), userId: users[3].id, name: 'Modern Villa', address: 'House 7, Rose Circle', capacity: 8.0 },
      { id: uuidv4(), userId: users[4].id, name: 'Green Appts', address: 'Unit 4, Sector 15', capacity: 10.0 },
    ];

    for (const house of houses) {
      await query(
        'INSERT INTO houses (id, user_id, name, address, capacity, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [house.id, house.userId, house.name, house.address, house.capacity]
      );
    }

    // 4. Create 24-hour Solar Production Data for Sellers
    const solarPattern = [
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 12am-5am
      0.1, 0.5, 1.2, 2.5, 3.8, 4.5, // 6am-11am
      5.0, 4.8, 4.2, 3.5, 2.1, 1.0, // 12pm-5pm
      0.2, 0.0, 0.0, 0.0, 0.0, 0.0  // 6pm-11pm
    ];

    for (const house of houses.slice(0, 2)) { // Only for sellers
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date();
        timestamp.setHours(hour, 0, 0, 0);

        await query(
          'INSERT INTO energy_production (id, house_id, timestamp, production, temperature) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), house.id, timestamp, solarPattern[hour] * (house.capacity / 10), 25 + Math.random() * 10]
        );
      }
    }

    console.log('✅ Seed successful!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    process.exit();
  }
}

seed();
