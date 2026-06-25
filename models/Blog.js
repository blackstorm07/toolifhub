import mongoose from 'mongoose';
import '@/models/User';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
      default: '',
    },
    featuredImage: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    // SEO
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.index({ status: 1 });
blogSchema.index({ featured: -1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
