import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const toolSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tool title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    fullDescription: {
      type: String,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: '🔧',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'coming-soon'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['worldwide', 'india_only'],
      default: 'worldwide',
    },
    faq: {
      type: [faqSchema],
      default: [],
    },
    relatedTools: {
      type: [String], // array of slugs
      default: [],
    },
    // SEO
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    seoContent: {
      type: {
        overview: String,
        features: [String],
        benefits: [String],
        howToUse: [String],
        useCases: [{ title: String, description: String }],
      },
      default: null,
    },
    // Stats
    views: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

toolSchema.index({ category: 1 });
toolSchema.index({ featured: -1 });
toolSchema.index({ trending: -1 });
toolSchema.index({ views: -1 });
toolSchema.index({ status: 1 });
toolSchema.index(
  { title: 'text', shortDescription: 'text', keywords: 'text' },
  { weights: { title: 10, keywords: 5, shortDescription: 2 } }
);

const Tool = mongoose.models.Tool || mongoose.model('Tool', toolSchema);

export default Tool;
