'use client';

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const paymentMethods = ['cash', 'card', 'gcash', 'maya'] as const;

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<typeof paymentMethods[number]>('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.filter((p: Product) => p.stock > 0));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product._id === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        setError('Insufficient stock');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setError('');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p._id === productId);
    if (product && quantity > product.stock) {
      setError('Insufficient stock');
      return;
    }

    setCart(
      cart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
    setError('');
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return 0; // No tax for now, but can be configured
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const orderData = {
        customerId: selectedCustomer?._id,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerEmail: selectedCustomer?.email,
        customerPhone: selectedCustomer?.phone,
        items: cart.map((item) => ({
          productId: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity,
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        status: 'completed',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(`Order ${data.orderNumber} completed successfully!`);
        setCart([]);
        setSelectedCustomer(null);
        setSearchProduct('');
        fetchProducts(); // Refresh products to update stock
      }
    } catch (error) {
      setError('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    customer.phone.includes(searchCustomer)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Search */}
          <div className="bg-white p-4 rounded-lg shadow">
            <input
              type="text"
              placeholder="Search products..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Products Grid */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-4">Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-bold">₱{product.price}</span>
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Customer</h2>
            {selectedCustomer ? (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                    <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm"
                />
                {searchCustomer && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setSearchCustomer('');
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Optional: Select a customer or process as walk-in
                </p>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.product._id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          ₱{item.product.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-red-600 text-xs hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product._id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        min="1"
                        max={item.product.stock}
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                      <span className="ml-auto font-semibold text-green-700">
                        ₱{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Total */}
          {cart.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₱{calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-700">₱{calculateTotal().toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as typeof paymentMethods[number])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
