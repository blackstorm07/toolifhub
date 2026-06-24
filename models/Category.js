import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '🔧',
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: tool count (populated separately)
categorySchema.virtual('toolCount', {
  ref: 'Tool',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

categorySchema.index({ slug: 1 });
categorySchema.index({ featured: -1 });

const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
