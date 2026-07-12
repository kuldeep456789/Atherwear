import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  variant: {
    color: string;
    size: string;
  };
}

interface CartState {
  cartItems: CartItem[];
  shippingAddress: any;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  couponDiscount: number;
  appliedCoupon: string;
}

const initialState: CartState = {
  cartItems: localStorage.getItem('cartItems') 
    ? JSON.parse(localStorage.getItem('cartItems') as string) 
    : [],
  shippingAddress: localStorage.getItem('shippingAddress') 
    ? JSON.parse(localStorage.getItem('shippingAddress') as string) 
    : {},
  paymentMethod: 'Razorpay',
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  couponDiscount: localStorage.getItem('couponDiscount')
    ? Number(localStorage.getItem('couponDiscount'))
    : 0,
  appliedCoupon: localStorage.getItem('appliedCoupon')
    ? (localStorage.getItem('appliedCoupon') as string)
    : '',
};

// Shipping tiers:
// ₹0      → Free (empty cart)
// < ₹499  → ₹150 (standard)
// < ₹999  → ₹99
// < ₹5000 → ₹49
// >= ₹5000 → Free
const calcShipping = (itemsPrice: number, couponDiscount: number): number => {
  if (itemsPrice === 0) return 0;
  const discountedTotal = itemsPrice - couponDiscount;
  if (discountedTotal >= 5000) return 0;
  if (discountedTotal >= 999) return 49;
  if (discountedTotal >= 499) return 99;
  return 150;
};

// Known coupons — single source of truth
export const COUPONS: Record<string, { discount: (price: number) => number; min: number; desc: string }> = {
  AETHER10: {
    discount: (p) => Math.round(p * 0.1),
    min: 0,
    desc: '10% OFF on all items',
  },
  FREE100: {
    discount: () => 100,
    min: 1000,
    desc: 'Flat ₹100 OFF on orders above ₹1,000',
  },
  SUPER500: {
    discount: () => 500,
    min: 4000,
    desc: 'Flat ₹500 OFF on orders above ₹4,000',
  },
  NEWUSER: {
    discount: (p) => Math.round(p * 0.15),
    min: 500,
    desc: '15% OFF for first-time users',
  },
};

// Helper function to update prices
const updateCart = (state: CartState) => {
  state.itemsPrice = state.cartItems.reduce((acc, item) => {
    const price = Number(item.price);
    return isNaN(price) ? acc : acc + price * item.qty;
  }, 0);

  // Calculate coupon discount
  const couponDef = COUPONS[state.appliedCoupon];
  if (couponDef && state.itemsPrice >= couponDef.min) {
    state.couponDiscount = couponDef.discount(state.itemsPrice);
  } else {
    state.couponDiscount = 0;
    if (state.appliedCoupon && !couponDef) {
      state.appliedCoupon = ''; // reset invalid coupons
    }
  }

  state.shippingPrice = calcShipping(state.itemsPrice, state.couponDiscount);

  // GST 18% on amount after discount but before shipping
  const taxableAmount = Math.max(0, state.itemsPrice - state.couponDiscount);
  state.taxPrice = Number((0.18 * taxableAmount).toFixed(2));

  // Grand total
  state.totalPrice = Number((taxableAmount + state.shippingPrice + state.taxPrice).toFixed(2));

  localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  localStorage.setItem('appliedCoupon', state.appliedCoupon);
  localStorage.setItem('couponDiscount', String(state.couponDiscount));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x._id === item._id && x.variant.size === item.variant.size && x.variant.color === item.variant.color
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id && x.variant.size === existItem.variant.size && x.variant.color === existItem.variant.color ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      updateCart(state);
    },
    removeFromCart: (state, action: PayloadAction<{id: string, size: string, color: string}>) => {
      state.cartItems = state.cartItems.filter(
        (x) => !(x._id === action.payload.id && x.variant.size === action.payload.size && x.variant.color === action.payload.color)
      );
      updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      updateCart(state);
    },
    applyCoupon: (state, action: PayloadAction<string>) => {
      state.appliedCoupon = action.payload;
      updateCart(state);
    },
    removeCoupon: (state) => {
      state.appliedCoupon = '';
      state.couponDiscount = 0;
      updateCart(state);
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  saveShippingAddress, 
  savePaymentMethod, 
  clearCartItems,
  applyCoupon,
  removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;
