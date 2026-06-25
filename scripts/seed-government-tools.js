/**
 * Additive seed: inserts/updates only the "Government Tools" category and its
 * tools. Does NOT touch any other Category/Tool/Blog/User documents.
 *
 * Run with: node scripts/seed-government-tools.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const CategorySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, icon: String,
  description: String, featured: Boolean, order: Number,
}, { timestamps: true });

const ToolSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  shortDescription: String, fullDescription: String, keywords: [String],
  icon: String, featured: Boolean, trending: Boolean,
  status: { type: String, enum: ['active', 'inactive', 'coming-soon'], default: 'active' },
  faq: [{ question: String, answer: String }],
  relatedTools: [String],
  seoTitle: String, seoDescription: String, seoKeywords: [String],
  views: { type: Number, default: 0 }, usageCount: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);

const CATEGORY = {
  name: 'Government Tools', slug: 'government-tools', icon: '🏛️',
  description: 'India government and public-data tools — GSTIN validation, PIN code lookup, IFSC finder, mandi prices, and more.',
  featured: true, order: 16,
};

const TOOLS = [
  {
    title: 'GSTIN Validator', slug: 'gstin-validator', icon: '🧾',
    shortDescription: 'Validate any Indian GSTIN, check its checksum, and extract the state code.',
    fullDescription: 'Validate a 15-character Indian GSTIN (GST Identification Number) using the official format rules and checksum algorithm. Instantly see whether the format and checksum are valid, and which state the GSTIN was issued in.',
    keywords: ['gstin validator', 'gst number validator', 'gst number check', 'validate gstin', 'gst checksum'],
    featured: true, trending: false, status: 'active',
    faq: [
      { question: 'What is a GSTIN?', answer: 'GSTIN (Goods and Services Tax Identification Number) is a unique 15-character alphanumeric code assigned to every business registered under GST in India.' },
      { question: 'How is the GSTIN checksum validated?', answer: 'The 15th character of a GSTIN is a checksum digit computed from the first 14 characters using a defined algorithm. This tool recomputes it and compares it to verify validity.' },
      { question: 'Does this tool check GST registration status?', answer: 'This tool validates the GSTIN format and checksum only. Live registration status lookup requires GSTN portal access and is not available via a free public API.' },
    ],
    relatedTools: ['gst-calculator'],
    seoTitle: 'GSTIN Validator — Validate GST Number Online | ToolifHub',
    seoDescription: 'Validate any Indian GSTIN format and checksum, and extract the issuing state code. Free GST number validator.',
  },
  {
    title: 'PIN Code Lookup', slug: 'pin-code-lookup', icon: '📮',
    shortDescription: 'Look up Indian PIN codes to find state, district, taluka, and post offices.',
    fullDescription: 'Search any 6-digit Indian postal PIN code to find the associated state, district, taluka (block), and the list of post offices serving that PIN code. Data sourced from India Post.',
    keywords: ['pin code lookup', 'pincode finder', 'postal code india', 'find pin code', 'india post pincode'],
    featured: true, trending: true, status: 'active',
    faq: [
      { question: 'How many digits does an Indian PIN code have?', answer: 'Indian PIN codes (Postal Index Number) are 6 digits long. The first digit represents a postal zone, and the rest narrow down to a specific area.' },
      { question: 'Where does the PIN code data come from?', answer: 'This tool uses the public India Post PIN code data via api.postalpincode.in.' },
    ],
    relatedTools: ['post-office-finder', 'ifsc-code-finder'],
    seoTitle: 'PIN Code Lookup — Find State, District & Post Offices | ToolifHub',
    seoDescription: 'Look up any Indian PIN code to find the state, district, taluka, and post offices serving that area.',
  },
  {
    title: 'Post Office Finder', slug: 'post-office-finder', icon: '🏤',
    shortDescription: 'Find post offices by city, district, or post office name across India.',
    fullDescription: 'Search for Indian post offices by name, city, or district and see all matching post offices along with their PIN code, branch type, and delivery status.',
    keywords: ['post office finder', 'find post office', 'india post office search', 'post office near me', 'post office by city'],
    featured: false, trending: false, status: 'active',
    faq: [
      { question: 'Can I search by city or district name?', answer: 'Yes, you can search by post office name, city, or district and the tool will return all matching post offices with their PIN codes.' },
    ],
    relatedTools: ['pin-code-lookup', 'ifsc-code-finder'],
    seoTitle: 'Post Office Finder — Search India Post Offices | ToolifHub',
    seoDescription: 'Find post offices anywhere in India by name, city, or district. See PIN codes and branch details instantly.',
  },
  {
    title: 'IFSC Code Finder', slug: 'ifsc-code-finder', icon: '🏦',
    shortDescription: 'Look up any Indian bank IFSC code to get the bank, branch, and address.',
    fullDescription: 'Enter an 11-character IFSC code to instantly find the bank name, branch name, full address, city, district, state, and contact details. Useful for verifying bank details before NEFT/RTGS/IMPS transfers.',
    keywords: ['ifsc code finder', 'ifsc code search', 'find ifsc code', 'bank branch finder', 'neft ifsc lookup'],
    featured: true, trending: true, status: 'active',
    faq: [
      { question: 'What is an IFSC code?', answer: 'IFSC (Indian Financial System Code) is an 11-character alphanumeric code that uniquely identifies a bank branch for electronic fund transfers like NEFT, RTGS, and IMPS.' },
      { question: 'Where can I find my IFSC code?', answer: 'Your IFSC code is printed on your bank passbook or cheque book, or you can search by bank and branch name using this tool.' },
    ],
    relatedTools: ['pin-code-lookup', 'post-office-finder'],
    seoTitle: 'IFSC Code Finder — Search Bank Branch IFSC Codes | ToolifHub',
    seoDescription: 'Find the bank, branch, and address for any Indian IFSC code. Free IFSC code lookup for NEFT, RTGS, and IMPS transfers.',
  },
  {
    title: 'Mandi Price Checker', slug: 'mandi-price-checker', icon: '🌾',
    shortDescription: 'Check the latest mandi (market) prices for agricultural commodities across India.',
    fullDescription: 'Search daily mandi (market) prices for agricultural commodities by commodity name, state, and market. Data is sourced from the Government of India\'s open data platform and updated daily.',
    keywords: ['mandi price checker', 'mandi bhav', 'agricultural commodity prices', 'market price india', 'crop price today'],
    featured: true, trending: false, status: 'active',
    faq: [
      { question: 'How often are mandi prices updated?', answer: 'Mandi prices are sourced from the Government of India open data platform (data.gov.in) and are typically updated daily by participating mandis.' },
      { question: 'Can I filter prices by state or market?', answer: 'Yes, you can filter results by commodity, state, and specific market (mandi) name.' },
    ],
    relatedTools: ['gst-calculator'],
    seoTitle: 'Mandi Price Checker — Daily Agricultural Commodity Prices | ToolifHub',
    seoDescription: 'Check the latest mandi prices for crops and commodities across Indian markets, sourced from government open data.',
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('Connected to MongoDB');

  const category = await Category.findOneAndUpdate(
    { slug: CATEGORY.slug },
    { $set: CATEGORY },
    { upsert: true, new: true }
  );
  console.log(`Category ready: ${category.name} (${category._id})`);

  for (const tool of TOOLS) {
    const doc = await Tool.findOneAndUpdate(
      { slug: tool.slug },
      { $set: { ...tool, category: category._id } },
      { upsert: true, new: true }
    );
    console.log(`  Tool ready: ${doc.title} (${doc.slug})`);
  }

  console.log('Done. No existing data was deleted.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
