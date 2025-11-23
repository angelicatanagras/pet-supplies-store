import mongoose, { Schema, Document } from 'mongoose';

export type Category = 'food' | 'vitamins' | 'toys' | 'medicine' | 'grooming' | 'accessories';
export type FoodSubCategory = 'cat' | 'dog' | 'bird';
export type FoodType = 'dry' | 'wet';

export interface IVariation {
  size: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  subCategory?: FoodSubCategory;
  foodType?: FoodType;
  variations?: IVariation[];
  image?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      enum: ['food', 'vitamins', 'toys', 'medicine', 'grooming', 'accessories'],
      required: true,
    },
    subCategory: {
      type: String,
      enum: ['cat', 'dog', 'bird'],
      required: function() {
        return this.category === 'food';
      },
    },
    foodType: {
      type: String,
      enum: ['dry', 'wet'],
      required: function() {
        return this.category === 'food' && (this.subCategory === 'cat' || this.subCategory === 'dog');
      },
    },
    variations: [{
      size: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      stock: { type: Number, required: true, min: 0, default: 0 },
    }],
    image: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
