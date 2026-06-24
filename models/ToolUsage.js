import mongoose from 'mongoose';

const toolUsageSchema = new mongoose.Schema(
  {
    toolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: true,
    },
    toolSlug: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

toolUsageSchema.index({ toolId: 1 });
toolUsageSchema.index({ toolSlug: 1 });
toolUsageSchema.index({ createdAt: -1 });
toolUsageSchema.index({ country: 1 });

const ToolUsage =
  mongoose.models.ToolUsage || mongoose.model('ToolUsage', toolUsageSchema);

export default ToolUsage;
