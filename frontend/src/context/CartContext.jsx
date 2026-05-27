import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Shipping constants
  const FREE_SHIPPING_THRESHOLD = 1000; // Free shipping over Rs. 1000
  const SHIPPING_COST = 100; // Rs. 100 shipping cost

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (food, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === food._id);
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = Math.min(existingItem.quantity + quantity, food.stock || 999);
        toast.success(`Updated ${food.name} quantity to ${newQuantity}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        return prevCart.map(item =>
          item._id === food._id
            ? { 
                ...item, 
                quantity: newQuantity,
                lastUpdated: new Date().toISOString()
              }
            : item
        );
      } else {
        // Add new item
        toast.success(`${food.name} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        return [...prevCart, { 
          ...food, 
          quantity,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    
    setCart(prevCart => {
      const item = prevCart.find(item => item._id === foodId);
      if (item) {
        const newQuantity = Math.min(quantity, item.stock || 999);
        if (newQuantity !== item.quantity) {
          toast.info(`Updated ${item.name} quantity to ${newQuantity}`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        
        return prevCart.map(item =>
          item._id === foodId
            ? { 
                ...item, 
                quantity: newQuantity,
                lastUpdated: new Date().toISOString()
              }
            : item
        );
      }
      return prevCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (foodId) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item._id === foodId);
      if (item) {
        toast.warning(`${item.name} removed from cart`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      return prevCart.filter(item => item._id !== foodId);
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate subtotal (before shipping)
  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discount > 0 ? item.discountedPrice : item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Calculate shipping cost
  const getShippingCost = () => {
    const subtotal = getCartSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };

  // Calculate grand total
  const getCartGrandTotal = () => {
    const subtotal = getCartSubtotal();
    const shipping = getShippingCost();
    return subtotal + shipping;
  };

  // Get cart total (alias for grand total)
  const getCartTotal = () => {
    return getCartGrandTotal();
  };

  // Check if item is in cart
  const isInCart = (foodId) => {
    return cart.some(item => item._id === foodId);
  };

  // Get item quantity in cart
  const getItemQuantity = (foodId) => {
    const item = cart.find(item => item._id === foodId);
    return item ? item.quantity : 0;
  };

  // Check if cart is empty
  const isCartEmpty = () => {
    return cart.length === 0;
  };

  // Get cart summary
  const getCartSummary = () => {
    const subtotal = getCartSubtotal();
    const shipping = getShippingCost();
    const total = getCartGrandTotal();
    const itemCount = getCartItemCount();

    return {
      subtotal,
      shipping,
      total,
      itemCount,
      hasFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD
    };
  };

  // Toggle cart open/close
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  // Close cart
  const closeCart = () => {
    setCartOpen(false);
  };

  // Open cart
  const openCart = () => {
    setCartOpen(true);
  };

  // Check if cart has items with low stock
  const getLowStockItems = () => {
    return cart.filter(item => item.stock && item.quantity > item.stock);
  };

  // Validate cart (check stock availability)
  const validateCart = () => {
    const issues = [];
    
    cart.forEach(item => {
      if (item.stock && item.quantity > item.stock) {
        issues.push({
          itemId: item._id,
          itemName: item.name,
          requested: item.quantity,
          available: item.stock,
          message: `Only ${item.stock} available`
        });
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const value = {
    cart,
    loading,
    cartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getCartSubtotal,
    getShippingCost,
    getCartGrandTotal,
    isInCart,
    getItemQuantity,
    isCartEmpty,
    getCartSummary,
    toggleCart,
    closeCart,
    openCart,
    getLowStockItems,
    validateCart,
    setLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
