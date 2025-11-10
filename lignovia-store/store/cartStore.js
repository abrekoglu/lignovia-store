import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add product to cart or increase quantity if already exists
      addToCart: (product) => {
        set((state) => {
          // Get the product ID (support both _id and id)
          const productId = product._id || product.id;
          
          if (!productId) {
            console.error("Cannot add product to cart: missing ID", product);
            return state;
          }

          const existingItem = state.items.find(
            (item) => (item._id || item.id) === productId
          );

          if (existingItem) {
            // Increase quantity if product already in cart
            return {
              items: state.items.map((item) => {
                const itemId = item._id || item.id;
                if (itemId === productId) {
                  return { ...item, quantity: item.quantity + 1 };
                }
                return item;
              }),
            };
          } else {
            // Add new product with quantity 1
            // Ensure both _id and id are set for consistency
            return {
              items: [
                ...state.items,
                {
                  ...product,
                  _id: productId,
                  id: productId,
                  quantity: 1,
                },
              ],
            };
          }
        });
      },

  // Remove item from cart completely
  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => {
        const itemId = item._id || item.id;
        return itemId !== productId;
      }),
    }));
  },

  // Increase quantity for a specific product
  increaseQuantity: (productId) => {
    set((state) => ({
      items: state.items.map((item) => {
        const itemId = item._id || item.id;
        if (itemId === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    }));
  },

  // Decrease quantity, remove if quantity becomes 0
  decreaseQuantity: (productId) => {
    set((state) => {
      const item = state.items.find((item) => {
        const itemId = item._id || item.id;
        return itemId === productId;
      });

      if (!item) return state;

      if (item.quantity <= 1) {
        // Remove item if quantity is 1 or less
        return {
          items: state.items.filter((item) => {
            const itemId = item._id || item.id;
            return itemId !== productId;
          }),
        };
      } else {
        // Decrease quantity
        return {
          items: state.items.map((item) => {
            const itemId = item._id || item.id;
            if (itemId === productId) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return item;
          }),
        };
      }
    });
  },

  // Clear all items from cart
  clearCart: () => {
    set({ items: [] });
  },

  // Computed property: total number of items in cart
  getTotalItems: () => {
    const items = get().items;
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  // Computed property: total price of all items in cart
  getTotalPrice: () => {
    const items = get().items;
    return items.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
  },
    }),
    {
      name: "cart-storage", // unique name for localStorage key
      // Only persist the 'items' array, not the functions
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selectors for computed values
export const useCartTotalItems = () => useCartStore((state) => 
  state.items.reduce((total, item) => total + item.quantity, 0)
);

export const useCartTotalPrice = () => useCartStore((state) =>
  state.items.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  )
);

// Alias for cart items
export const useCart = () => useCartStore((state) => state.items);

export default useCartStore;

