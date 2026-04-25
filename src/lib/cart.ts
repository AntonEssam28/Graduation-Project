export type CartItem = {
  id: string; // Changed to string for MongoDB ObjectId
  name: string;
  type: string;
  price: number;
  quantity: number;
  image: string;
  shelterId: string;
  shelterName?: string;
  shelterPhone?: string;
};

export const CART_STORAGE_KEY = "pawcare_cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const addToCart = (product: any, quantity: number = 1) => {
  if (typeof window === "undefined") return;
  const cart = getCart();
  const productId = product._id || product.id;
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    const shelterName = product.shelter?.name || product.shelterName;
    
    cart.push({
      id: productId,
      name: product.name,
      type: product.category,
      price: product.price,
      quantity,
      image: product.photo || "",
      shelterId: product.shelter?._id || product.shelterId || product.shelter || "",
      shelterName: shelterName && shelterName !== "Official Store" ? shelterName : (product.shelter?.name || "Official Store"),
      shelterPhone: product.shelter?.phone || product.shelterPhone || "",
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};

export const initialCart: CartItem[] = [];