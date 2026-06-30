/**
 * Migration: renames the existing "Random Name Generator" tool document to
 * "Random User Generator" (slug random-name-generator -> random-user-generator)
 * in place, preserving _id/views/createdAt. Also updates any other tool's
 * relatedTools array that still references the old slug, and refreshes the
 * SEO/FAQ/keyword fields to match the new feature set. Idempotent — safe to
 * run multiple times.
 *
 * Run with: node scripts/migrate-rename-random-name-generator.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const OLD_SLUG = 'random-name-generator';
const NEW_SLUG = 'random-user-generator';

const UPDATED_FIELDS = {
  title: 'Random User Generator',
  slug: NEW_SLUG,
  icon: '👤',
  shortDescription: 'Generate realistic random user profiles with names, countries, and email addresses.',
  fullDescription:
    'Generate realistic random user profiles — full names, gender, country, email address, username, and UUID — for developers, QA engineers, designers, and anyone needing sample user data. Choose from 14 supported countries or generate an international mix. Everything runs locally, fully offline.',
  keywords: [
    'random user generator',
    'fake user generator',
    'random profile generator',
    'dummy user generator',
    'sample user data',
    'random email generator',
    'random person generator',
    'random user profile',
    'mock user generator',
    'developer test data',
    'qa test data',
    'user data generator',
    'random identity generator',
    'sample database generator',
    'free user generator',
    'online user generator',
    'random name generator',
    'generate random users',
    'mock data generator',
    'ToolifHub',
  ],
  faq: [
    {
      question: 'What is a random user generator used for?',
      answer:
        "Random user generators are used by developers and QA engineers to populate test databases, by designers to mock up UI with realistic data, and by writers or students to create sample profiles — without using real people's information.",
    },
    {
      question: 'Are the generated emails real?',
      answer:
        'No. Email addresses are generated locally from realistic name-based patterns and sample domains (example.com, mail.com, outlook.com, gmail.com) — they are not verified to exist and nothing is sent to any server.',
    },
    {
      question: 'Does this tool generate phone numbers?',
      answer:
        'No, this tool intentionally does not generate phone numbers — only name, gender, country, email, username, and UUID.',
    },
  ],
  relatedTools: ['uuid-generator', 'random-number-generator'],
  seoTitle: 'Random User Generator – Generate Random Users & Email Addresses Online Free | ToolifHub',
  seoDescription:
    'Generate realistic random user profiles with names, countries, and email addresses instantly. Perfect for developers, QA testing, UI design, mock databases, and sample user data.',
};

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('Connected to MongoDB');

  const tools = mongoose.connection.db.collection('tools');

  const existing = await tools.findOne({ slug: OLD_SLUG });
  const alreadyRenamed = await tools.findOne({ slug: NEW_SLUG });

  if (existing) {
    await tools.updateOne({ slug: OLD_SLUG }, { $set: UPDATED_FIELDS });
    console.log(`Renamed tool "${OLD_SLUG}" -> "${NEW_SLUG}".`);
  } else if (alreadyRenamed) {
    // Already renamed in a previous run — just refresh the content fields
    // in case this migration's copy changed since.
    await tools.updateOne({ slug: NEW_SLUG }, { $set: UPDATED_FIELDS });
    console.log(`Tool already at "${NEW_SLUG}" — refreshed content fields.`);
  } else {
    console.log(`No tool found with slug "${OLD_SLUG}" or "${NEW_SLUG}" — nothing to migrate.`);
  }

  const relatedToolsResult = await tools.updateMany(
    { relatedTools: OLD_SLUG },
    { $set: { 'relatedTools.$[elem]': NEW_SLUG } },
    { arrayFilters: [{ elem: OLD_SLUG }] }
  );
  console.log(`Updated relatedTools references in ${relatedToolsResult.modifiedCount} other tool document(s).`);

  console.log('Migration complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
