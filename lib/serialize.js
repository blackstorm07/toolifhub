import mongoose from 'mongoose';

/**
 * Recursively converts Mongoose ObjectIds (and anything else with a
 * non-plain prototype, e.g. Buffer) into plain values so the result can be
 * passed as a prop from a Server Component to a Client Component.
 *
 * `.lean()` strips Mongoose document methods, but ObjectId/Buffer values
 * nested inside the result (e.g. `_id`, populated refs) are left untouched —
 * this fills that gap.
 */
export function serializeDoc(value) {
  if (value == null) return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (Buffer.isBuffer(value)) return value.toString('hex');
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(serializeDoc);
  if (typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeDoc(val);
    }
    return result;
  }
  return value;
}
