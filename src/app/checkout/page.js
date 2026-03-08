"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiTruck,
  FiCreditCard,
  FiCheckCircle,
  FiArrowLeft,
  FiLock,
  FiMapPin,
} from "react-icons/fi";
import { useCartStore, useAuthStore } from "@/store";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import MobileBottomNav from "@/components/customer/MobileBottomNav";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const subtotal = getTotal() || 0;
  const shippingCost = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08 || 0;
  const total = (subtotal + shippingCost + tax - discount) || 0;

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push("/cart");
    }
  }, [items, orderPlaced, router]);

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const res = await fetch(`/api/coupons?code=${couponCode}`);
      const data = await res.json();

      if (res.ok && data.coupon) {
        const coupon = data.coupon;
        let discountAmount = 0;

        if (coupon.discountType === "percentage") {
          discountAmount = subtotal * (coupon.discountValue / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        setAppliedCoupon(coupon);
        setDiscount(discountAmount);
        toast.success("Coupon applied successfully!");
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (err) {
      toast.error("Failed to apply coupon");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    if (
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.zipCode
    ) {
      toast.error("Please fill in all required shipping details");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          name: item.name,
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity, 10) || 1,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        shippingAddress,
        paymentMethod,
        subtotal: parseFloat(subtotal) || 0,
        shippingCost: parseFloat(shippingCost) || 0,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        couponCode: appliedCoupon?.code,
        total: parseFloat(total) || 0,
        isGuestOrder: !user,
        guestEmail: !user ? shippingAddress.email : null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderNumber(data.order.orderNumber);
        setOrderPlaced(true);
        clearCart();
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-primary dark:text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Thank you for your order
          </p>
          <p className="text-lg font-semibold dark:text-gray-200 mb-6">
            Order Number: <span className="text-accent">{orderNumber}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            A confirmation email has been sent to {shippingAddress.email}
          </p>
          <div className="space-y-3">
            <Link
              href={`/orders/${orderNumber}`}
              className="block btn btn-primary w-full"
            >
              Track Your Order
            </Link>
            <Link href="/collections" className="block btn btn-outline w-full">
              Continue Shopping
            </Link>
          </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="py-8 pt-20 lg:pt-8 transition-colors">
        <div className="container">
        <div className="flex items-center mb-8">
          <Link
            href="/cart"
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-accent dark:hover:text-accent"
          >
            <FiArrowLeft className="mr-2" /> Back to Cart
          </Link>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-accent text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"}`}
            >
              1
            </div>
            <span className="ml-2 font-medium dark:text-gray-200">
              Shipping
            </span>
            <div className="w-16 h-1 bg-gray-200 dark:bg-slate-700 mx-4">
              <div
                className={`h-full bg-accent transition-all ${step >= 2 ? "w-full" : "w-0"}`}
              />
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-accent text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"}`}
            >
              2
            </div>
            <span className="ml-2 font-medium dark:text-gray-200">Payment</span>
            <div className="w-16 h-1 bg-gray-200 dark:bg-slate-700 mx-4">
              <div
                className={`h-full bg-accent transition-all ${step >= 3 ? "w-full" : "w-0"}`}
              />
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-accent text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"}`}
            >
              3
            </div>
            <span className="ml-2 font-medium dark:text-gray-200">Confirm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                  <FiMapPin className="mr-2" /> Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Germany</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-primary w-full mt-6"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                  <FiCreditCard className="mr-2" /> Payment Method
                </h2>
                <div className="space-y-4 mb-6">
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "card" ? "border-accent bg-accent/5" : "border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <FiCreditCard className="text-xl mr-3" />
                    <div>
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">
                        Pay securely with your card
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "paypal" ? "border-accent bg-accent/5" : "border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <span className="text-xl font-bold mr-3">PP</span>
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-500">
                        Pay with your PayPal account
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-accent bg-accent/5" : "border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <FiTruck className="text-xl mr-3" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">
                        Pay when you receive
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl mb-6">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="input"
                      maxLength="19"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="input"
                        maxLength="5"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="input"
                        maxLength="4"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      className="input"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-outline flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="btn btn-primary flex-1"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold mb-6 dark:text-white">
                  Review Your Order
                </h2>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 dark:text-gray-200">
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="font-medium dark:text-white">
                      {shippingAddress.fullName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {shippingAddress.street}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {shippingAddress.country}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {shippingAddress.email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {shippingAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 dark:text-gray-200">
                    Payment Method
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="font-medium capitalize dark:text-white">
                      {paymentMethod === "cod" ?
                        "Cash on Delivery"
                      : paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2 dark:text-gray-200">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                          {item.size && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Size: {item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Color: {item.color}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="btn btn-outline flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ?
                      <span className="flex items-center justify-center">
                        <span
                          className="spinner mr-2"
                          style={{ width: 16, height: 16 }}
                        />
                        Processing...
                      </span>
                    : <>
                        <FiLock className="mr-2" /> Place Order ($
                        {total.toFixed(2)})
                      </>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 dark:text-white">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1 dark:text-gray-200">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm dark:text-gray-200">
                      ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="dark:text-white">${(parseFloat(subtotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="dark:text-white">
                    {shippingCost === 0 ?
                      "Free"
                    : `$${(parseFloat(shippingCost) || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="dark:text-white">${(parseFloat(tax) || 0).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm mb-2 text-green-500">
                    <span>Discount</span>
                    <span>-${(parseFloat(discount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span className="dark:text-white">Total</span>
                  <span className="text-accent">${(parseFloat(total) || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="input flex-1"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ?
                    <button
                      onClick={removeCoupon}
                      className="btn btn-outline px-3"
                    >
                      ✕
                    </button>
                  : <button
                      onClick={applyCoupon}
                      className="btn btn-secondary px-4"
                    >
                      Apply
                    </button>
                  }
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-500 mt-1">
                    {appliedCoupon.code} applied (-${discount.toFixed(2)})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiLock />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
