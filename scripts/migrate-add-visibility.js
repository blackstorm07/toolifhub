/**
 * Migration: backfills `visibility: "worldwide"` onto every existing
 * Category and Tool document that doesn't already have a `visibility` field
 * (i.e. everything created before this feature). Additive and idempotent —
 * safe to run multiple times, never deletes or overwrites existing data.
 *
 * Run with: node scripts/migrate-add-visibility.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('Connected to MongoDB');

  const categoriesResult = await mongoose.connection.db
    .collection('categories')
    .updateMany({ visibility: { $exists: false } }, { $set: { visibility: 'worldwide' } });
  console.log(`Categories backfilled: ${categoriesResult.modifiedCount}`);

  const toolsResult = await mongoose.connection.db
    .collection('tools')
    .updateMany({ visibility: { $exists: false } }, { $set: { visibility: 'worldwide' } });
  console.log(`Tools backfilled: ${toolsResult.modifiedCount}`);

  console.log('Migration complete. No existing data was deleted or overwritten beyond adding the new field.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
