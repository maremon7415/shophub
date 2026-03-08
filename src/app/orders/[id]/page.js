"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiArrowLeft,
} from "react-icons/fi";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: FiClock },
  { key: "processing", label: "Processing", icon: FiPackage },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "delivered", label: "Delivered", icon: FiCheckCircle },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchOrderNumber, setSearchOrderNumber] = useState(params.id || "");

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id);
    }
  }, [params.id]);

  const fetchOrder = async (orderNumber) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      const data = await res.json();

      if (res.ok) {
        setOrder(data.order);
      } else {
        setError(data.message || "Order not found");
      }
    } catch (err) {
      setError("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderNumber.trim()) {
      fetchOrder(searchOrderNumber.trim());
    }
  };

  const getCurrentStep = () => {
    const statusIndex = statusSteps.findIndex((s) => s.key === order?.status);
    return statusIndex >= 0 ? statusIndex : 0;
  };

  if (!params.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 transition-colors">
        <div className="container">
          <div className="max-w-md mx-auto">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-accent mb-6"
            >
              <FiArrowLeft className="mr-2" /> Back to Home
            </Link>
            <div className="bg-white rounded-2xl shadow-card p-8">
              <h1 className="text-2xl font-bold text-center mb-6">
                Track Your Order
              </h1>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  placeholder="Enter your order number"
                  className="input mb-4"
                />
                <button type="submit" className="btn btn-primary w-full">
                  Track Order
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 transition-colors">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="skeleton h-8 w-48 mb-8" />
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="skeleton h-64 mb-6" />
              <div className="space-y-4">
                <div className="skeleton h-20" />
                <div className="skeleton h-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 transition-colors">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <Link
              href="/"
              className="flex items-center justify-center text-gray-600 hover:text-accent mb-6"
            >
              <FiArrowLeft className="mr-2" /> Back to Home
            </Link>
            <div className="bg-white rounded-2xl shadow-card p-8">
              <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <form onSubmit={handleSearch} className="space-y-4">
                <input
                  type="text"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  placeholder="Try another order number"
                  className="input"
                />
                <button type="submit" className="btn btn-primary w-full">
                  Search Again
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 transition-colors">
      <div className="container">
        <Link
          href="/"
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-accent mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Home
        </Link>

          <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Order {order.orderNumber}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`badge ${
                  order.status === "delivered" ? "badge-success"
                  : order.status === "cancelled" ? "badge-error"
                  : order.status === "processing" ? "badge-info"
                  : "badge-warning"
                } text-sm py-1 px-3`}
              >
                {order.status}
              </span>
            </div>

              <div className="relative">
              <div className="flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ?
                            "bg-accent text-white"
                          : "bg-gray-200 dark:bg-slate-700 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-accent/30" : ""}`}
                      >
                        <Icon size={20} />
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${isCompleted ? "text-accent font-medium" : "text-gray-400"}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 z-0">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{
                    width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Shipping Address</h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
              <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiMail size={16} />
                  <span className="text-sm">{order.shippingAddress.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiPhone size={16} />
                  <span className="text-sm">{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-800 dark:text-white">${(parseFloat(order.subtotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-800 dark:text-white">
                    {parseFloat(order.shippingCost) === 0 ?
                      "Free"
                    : `$${(parseFloat(order.shippingCost) || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-800 dark:text-white">${(parseFloat(order.tax) || 0).toFixed(2)}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-${(parseFloat(order.discount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-slate-700">
                  <span className="text-gray-800 dark:text-white">Total</span>
                  <span className="text-accent">
                    ${(parseFloat(order.total) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Payment:{" "}
                  <span className="capitalize text-gray-800 dark:text-white">{order.paymentMethod}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Payment Status:{" "}
                  <span
                    className={`badge ${order.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {parseInt(item.quantity, 10) || 1} × ${(parseFloat(item.price) || 0).toFixed(2)}
                    </p>
                    {item.size && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Color: {item.color}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
