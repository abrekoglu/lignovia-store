import mongoose from "mongoose";

/**
 * LIGNOVIA Category Schema
 * 
 * Complete category schema supporting:
 * - Basic category information
 * - Hierarchical parent-child relationships
 * - Unlimited nesting levels
 * - SEO optimization
 * - Visibility control
 * - Sorting and organization
 */

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    maxlength: [200, "Category name cannot exceed 200 characters"],
  },
  slug: {
    type: String,
    required: [true, "Category slug is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
    default: "",
  },
  image: {
    type: String,
    trim: true,
    default: "",
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  // SEO fields
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, "SEO title cannot exceed 60 characters"],
    default: "",
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, "SEO description cannot exceed 160 characters"],
    default: "",
  },
  seoKeywords: {
    type: [String],
    default: [],
  },
  // Analytics
  productCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for performance
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ visibility: 1 });
CategorySchema.index({ sortOrder: 1 });

// Virtual for children (will be populated when needed)
CategorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Ensure virtuals are included in JSON
CategorySchema.set("toJSON", { virtuals: true });
CategorySchema.set("toObject", { virtuals: true });

// Pre-save hook to auto-generate slug if not provided
CategorySchema.pre("save", async function (next) {
  if (!this.isModified("name") || this.slug) {
    return next();
  }

  // Generate slug from name
  let slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Ensure slug is unique
  const Category = mongoose.model("Category");
  let counter = 1;
  let uniqueSlug = slug;

  while (await Category.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  this.slug = uniqueSlug;
  next();
});

// Static method to check for circular references
CategorySchema.statics.checkCircularReference = async function (categoryId, parentId) {
  if (!parentId) return false;
  
  const Category = this;
  let currentParentId = parentId;

  // Traverse up the parent chain
  while (currentParentId) {
    if (currentParentId.toString() === categoryId.toString()) {
      return true; // Circular reference detected
    }

    const parent = await Category.findById(currentParentId);
    if (!parent || !parent.parentCategory) {
      break;
    }
    currentParentId = parent.parentCategory;
  }

  return false;
};

// Static method to get category path (breadcrumb)
CategorySchema.statics.getCategoryPath = async function (categoryId) {
  const Category = this;
  const path = [];
  let currentId = categoryId;

  while (currentId) {
    const category = await Category.findById(currentId);
    if (!category) break;

    path.unshift(category.name);
    currentId = category.parentCategory;
  }

  return path;
};

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;


