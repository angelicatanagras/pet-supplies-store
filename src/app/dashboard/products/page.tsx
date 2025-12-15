'use client';

import { useState, useEffect } from 'react';
import { Product, Variation } from '@/types';

const categories = ['food', 'vitamins', 'toys', 'medicine', 'grooming', 'accessories'] as const;
const subCategories = ['cat', 'dog', 'bird'] as const;
const foodTypes = ['dry', 'wet'] as const;

const drySizes = ['1KG', '2KG', '5KG', '10KG', '15KG', '20KG'];
const wetSizes = ['85g', '185g', '400g', '6 x 85g', '12 x 85g', '24 x 85g'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'food' as typeof categories[number],
    subCategory: 'cat' as typeof subCategories[number],
    foodType: 'dry' as typeof foodTypes[number],
    image: '',
  });
  const [variations, setVariations] = useState<Variation[]>([]);
  const [newVariation, setNewVariation] = useState({ size: '', price: '', stock: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search, Filter, and Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'food',
      subCategory: 'cat',
      foodType: 'dry',
      image: '',
    });
    setVariations([]);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      subCategory: product.subCategory || 'cat',
      foodType: product.foodType || 'dry',
      image: product.image || '',
    });
    setVariations(product.variations || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariation = () => {
    if (newVariation.size && newVariation.price && newVariation.stock) {
      setVariations([...variations, {
        size: newVariation.size,
        price: parseFloat(newVariation.price),
        stock: parseInt(newVariation.stock),
      }]);
      setNewVariation({ size: '', price: '', stock: '' });
    }
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const addPresetSize = (size: string) => {
    if (!variations.find(v => v.size === size)) {
      setNewVariation({ ...newVariation, size });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Filter, Search, and Sort products
  const filteredAndSortedProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === filterCategory);
    }

    // SubCategory filter
    if (filterSubCategory !== 'all') {
      filtered = filtered.filter((product) => product.subCategory === filterSubCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (field: 'name' | 'price' | 'stock' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const isCatOrDog = formData.subCategory === 'cat' || formData.subCategory === 'dog';
      const hasVariations = formData.category === 'food' && isCatOrDog && variations.length > 0;

      const productData = {
        ...formData,
        price: hasVariations ? variations[0].price : parseFloat(formData.price),
        stock: hasVariations ? variations.reduce((sum, v) => sum + v.stock, 0) : parseInt(formData.stock),
        subCategory: formData.category === 'food' ? formData.subCategory : undefined,
        foodType: formData.category === 'food' && isCatOrDog ? formData.foodType : undefined,
        variations: hasVariations ? variations : undefined,
        image: formData.image || undefined,
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        resetForm();
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Animal Type</label>
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || filterCategory !== 'all' || filterSubCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterSubCategory('all');
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name/Brand</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof categories[number] })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category === 'food' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Animal Type</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value as typeof subCategories[number] })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.category === 'food' && (formData.subCategory === 'cat' || formData.subCategory === 'dog') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                  <div className="flex gap-4">
                    {foodTypes.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="foodType"
                          value={type}
                          checked={formData.foodType === type}
                          onChange={(e) => setFormData({ ...formData, foodType: e.target.value as typeof foodTypes[number] })}
                          className="mr-2"
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {!(formData.category === 'food' && (formData.subCategory === 'cat' || formData.subCategory === 'dog')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            {formData.category === 'food' && (formData.subCategory === 'cat' || formData.subCategory === 'dog') && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Size Variations</label>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Quick add sizes:</p>
                  <div className="flex flex-wrap gap-2">
                    {(formData.foodType === 'dry' ? drySizes : wetSizes).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addPresetSize(size)}
                        className={`px-2 py-1 text-xs rounded border ${
                          variations.find(v => v.size === size)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                        disabled={!!variations.find(v => v.size === size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Size (e.g., 1KG)"
                    value={newVariation.size}
                    onChange={(e) => setNewVariation({ ...newVariation, size: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    value={newVariation.price}
                    onChange={(e) => setNewVariation({ ...newVariation, price: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    min="0"
                    value={newVariation.stock}
                    onChange={(e) => setNewVariation({ ...newVariation, stock: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={addVariation}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {variations.length > 0 && (
                  <div className="space-y-2">
                    {variations.map((variation, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">
                          <strong>{variation.size}</strong> - ${variation.price} ({variation.stock} in stock)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {variations.length === 0 && (
                  <p className="text-sm text-amber-600">Add at least one size variation</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortField === 'name' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-2">
                  Category
                  {sortField === 'category' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-2">
                  Price
                  {sortField === 'price' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center gap-2">
                  Stock
                  {sortField === 'stock' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedProducts().length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {products.length === 0 ? 'No products yet. Add your first product!' : 'No products match your filters.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts().map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <div>{product.name}</div>
                    {product.variations && product.variations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.variations.map((v, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {v.size}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category}
                    {product.subCategory && ` (${product.subCategory})`}
                    {product.foodType && ` - ${product.foodType}`}
                  </td>
                  <td className="px-6 py-4">
                    {product.variations && product.variations.length > 0 ? (
                      <div className="text-xs space-y-1">
                        {product.variations.map((v, i) => (
                          <div key={i}>{v.size}: ${v.price}</div>
                        ))}
                      </div>
                    ) : (
                      `$${product.price}`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.variations && product.variations.length > 0 ? (
                      <div className="text-xs space-y-1">
                        {product.variations.map((v, i) => (
                          <div key={i}>{v.size}: {v.stock}</div>
                        ))}
                      </div>
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
