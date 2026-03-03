import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateDiscount(originalPrice, discountValue, discountType) {
  if (discountType === 'percentage') {
    return originalPrice - (originalPrice * discountValue / 100);
  }
  return originalPrice - discountValue;
}

export function validateCoupon(coupon, cartTotal, userId, usedCoupons = []) {
  const now = new Date();
  
  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  if (now < new Date(coupon.startDate) || now > new Date(coupon.expiryDate)) {
    return { valid: false, message: 'Coupon is expired' };
  }
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  const userUsage = usedCoupons.filter(c => c.userId.toString() === userId.toString()).length;
  if (userUsage >= coupon.perUserLimit) {
    return { valid: false, message: 'You have already used this coupon' };
  }
  
  if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
    return { valid: false, message: `Minimum order value of $${coupon.minOrderValue} required` };
  }
  
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = cartTotal * coupon.discountValue / 100;
    if (coupon.maxDiscountValue && discount > coupon.maxDiscountValue) {
      discount = coupon.maxDiscountValue;
    }
  } else {
    discount = coupon.discountValue;
  }
  
  return { valid: true, discount };
}
