'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiEye, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'badge-warning',
  processing: 'badge-info',
  shipped: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
  delivered: 'badge-success',
  cancelled: 'badge-error',
  refunded: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
};

const paymentStatusColors = {
  pending: 'badge-warning',
  paid: 'badge-success',
  failed: 'badge-error',
  refunded: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
};

export default function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    if (isRealTimeEnabled) {
      connectToRealTimeUpdates();
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [statusFilter, isRealTimeEnabled]);

  const connectToRealTimeUpdates = () => {
    const authStorage = localStorage.getItem('auth-storage');
    const token = authStorage ? JSON.parse(authStorage).state?.token : '';

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/admin/orders/realtime?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'orders_update' || data.type === 'order_updated') {
          setOrders(prevOrders => {
            if (data.order) {
              return [data.order, ...prevOrders.filter(o => o._id !== data.order._id)];
            }
            return data.orders || prevOrders;
          });
          setLastUpdate(new Date(data.timestamp));

          if (selectedOrder && data.order && data.order._id === selectedOrder._id) {
            setSelectedOrder(data.order);
          }
        }

        if (data.type === 'connected') {
          console.log('Real-time order tracking connected');
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      if (isRealTimeEnabled) {
        setTimeout(() => {
          connectToRealTimeUpdates();
        }, 5000);
      }
    };

    eventSourceRef.current = eventSource;
  };

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
    if (!isRealTimeEnabled) {
      connectToRealTimeUpdates();
    } else if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        toast.success('Order status updated!');
        setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const updateOrderWithTracking = async (orderId, status, trackingNumber, carrier) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state?.token : '';

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, trackingNumber, carrier }),
      });

      if (res.ok) {
        toast.success('Order updated with tracking!');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.orderNumber?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (order.shippingAddress?.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (order.shippingAddress?.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h1>
          <button
            onClick={toggleRealTime}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isRealTimeEnabled
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isRealTimeEnabled ? 'Live' : 'Off'}
          </button>
          {lastUpdate && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button onClick={fetchOrders} className="btn btn-outline">
          <FiRefreshCw className="mr-2" /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-20" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${selectedOrder?._id === order._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.shippingAddress?.fullName} • {order.shippingAddress?.city}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-white">${(parseFloat(order.total) || 0).toFixed(2)}</p>
                        <span className={`badge ${statusColors[order.status]} mt-1`}>
                          {order.status}
                        </span>
                        <span className={`badge ${paymentStatusColors[order.paymentStatus]} ml-1 mt-1`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        Tracking: {order.trackingNumber} ({order.carrier})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 h-fit sticky top-24">
          {selectedOrder ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Order Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedOrder.orderNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.shippingAddress?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.shippingAddress?.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedOrder.shippingAddress?.street}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}<br />
                    {selectedOrder.shippingAddress?.country}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {parseInt(item.quantity, 10) || 1} × ${(parseFloat(item.price) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-800 dark:text-white">${(parseFloat(selectedOrder.subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-800 dark:text-white">${(parseFloat(selectedOrder.shippingCost) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-800 dark:text-white">${(parseFloat(selectedOrder.tax) || 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Discount</span>
                      <span>-${(parseFloat(selectedOrder.discount) || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-800 dark:text-white">Total</span>
                    <span className="text-gray-800 dark:text-white">${(parseFloat(selectedOrder.total) || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder._id, status)}
                        disabled={selectedOrder.status === status}
                        className={`px-3 py-1 rounded-full text-sm capitalize ${
                            selectedOrder.status === status
                              ? 'bg-accent text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                  <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tracking Information</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        defaultValue={selectedOrder.trackingNumber}
                        id={`tracking-${selectedOrder._id}`}
                        className="input text-sm"
                      />
                      <select
                        defaultValue={selectedOrder.carrier}
                        id={`carrier-${selectedOrder._id}`}
                        className="input text-sm"
                      >
                        <option value="">Select Carrier</option>
                        <option value="UPS">UPS</option>
                        <option value="FedEx">FedEx</option>
                        <option value="USPS">USPS</option>
                        <option value="DHL">DHL</option>
                      </select>
                      <button
                        onClick={() => {
                          const tracking = document.getElementById(`tracking-${selectedOrder._id}`).value;
                          const carrier = document.getElementById(`carrier-${selectedOrder._id}`).value;
                          updateOrderWithTracking(selectedOrder._id, selectedOrder.status, tracking, carrier);
                        }}
                        className="btn btn-primary w-full text-sm"
                      >
                        Update Tracking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiEye className="mx-auto mb-2 text-2xl" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
