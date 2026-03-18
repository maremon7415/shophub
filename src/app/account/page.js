"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiGender,
  FiMapPin,
  FiLock,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiCheck,
  FiShoppingBag,
  FiChevronRight,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiGlobe,
  FiLink,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    profileUrl: "",
    isProfilePublic: true,
    socialLinks: { instagram: "", twitter: "", facebook: "" }
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchRecentOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.user) {
        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          dateOfBirth:
            data.user.dateOfBirth ?
              new Date(data.user.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: data.user.gender || "",
          bio: data.user.bio || "",
          profileUrl: data.user.profileUrl || data.user.image || "",
          isProfilePublic: data.user.isProfilePublic !== false,
          socialLinks: data.user.socialLinks || { instagram: "", twitter: "", facebook: "" }
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setFetchingProfile(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const res = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRecentOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch recent orders:", err);
    }
  };

  const handleProfileChange = (e) => {
    if (e.target.name.startsWith('social_')) {
      const network = e.target.name.split('_')[1];
      setProfile({
        ...profile,
        socialLinks: { ...profile.socialLinks, [network]: e.target.value }
      });
    } else if (e.target.type === 'checkbox') {
      setProfile({ ...profile, [e.target.name]: e.target.checked });
    } else {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Uploading avatar...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const authStorage = localStorage.getItem("auth-storage");
        const token = authStorage ? JSON.parse(authStorage).state?.token : "";

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64Data })
        });

        const data = await res.json();
        if (res.ok) {
          setProfile({ ...profile, profileUrl: data.url });
          toast.success('Avatar uploaded successfully', { id: toastId });
        } else {
          toast.error(data.error || 'Failed to upload avatar', { id: toastId });
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('An error occurred during upload', { id: toastId });
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem(
          "auth-storage",
          JSON.stringify({ state: { user: data, token } }),
        );
        toast.success("Profile updated successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address._id);
      setAddressForm({
        fullName: address.fullName || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "United States",
        phone: address.phone || "",
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        fullName: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        phone: "",
        isDefault: addresses.length === 0,
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const url =
        editingAddress ? `/api/addresses/${editingAddress}` : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });

      if (res.ok) {
        toast.success(editingAddress ? "Address updated!" : "Address added!");
        setShowAddressModal(false);
        fetchAddresses();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save address");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Delete this address?")) return;

    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage ? JSON.parse(authStorage).state?.token : "";

      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Address deleted!");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "orders", label: "Recent Orders", icon: FiShoppingBag },
    { id: "addresses", label: "Addresses", icon: FiMapPin },
    { id: "password", label: "Password", icon: FiLock },
  ];

  if (fetchingProfile) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-center py-20">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          My Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
          <div className="flex whitespace-nowrap p-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                    activeTab === tab.id ?
                      "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.id === 'profile' ? 'Profile' : tab.id === 'orders' ? 'Orders' : tab.id === 'addresses' ? 'Address' : 'Pass'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-8 min-h-[400px]">
          {activeTab === "profile" && (
            <form
              onSubmit={handleUpdateProfile}
              className="space-y-8 max-w-2xl animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 bg-linear-to-br from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-800 border border-amber-100 dark:border-slate-700 rounded-2xl shadow-sm">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-soft ring-4 ring-white dark:ring-slate-900 group relative shrink-0 overflow-hidden">
                  {profile.profileUrl ? (
                    <img src={profile.profileUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.name?.charAt(0).toUpperCase() || "U"
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <FiEdit2 size={24} className="text-white drop-shadow-md" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
                  </label>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white mb-1">
                    {profile.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 text-sm md:text-base">
                    <FiMail className="text-amber-500 shrink-0" /> 
                    <span className="truncate max-w-[200px] md:max-w-none">{profile.email}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="input bg-gray-100 dark:bg-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleProfileChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiGlobe className="text-accent" /> Public Profile
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your public presence on ShopHub.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isProfilePublic" checked={profile.isProfilePublic} onChange={handleProfileChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent hover:opacity-90"></div>
                  </label>
                </div>
                
                {profile.isProfilePublic && user?.userId && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden w-full">
                      <FiLink className="text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate select-all">{typeof window !== 'undefined' ? window.location.origin : ''}/profile/{user.userId}</span>
                    </div>
                    <Link href={`/profile/${user.userId}`} className="btn btn-outline py-2 text-sm whitespace-nowrap shrink-0">
                      View Profile
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      className="input"
                      rows="3"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiInstagram /> Instagram Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                      <input
                        type="text"
                        name="social_instagram"
                        value={profile.socialLinks.instagram}
                        onChange={handleProfileChange}
                        className="input pl-8"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FiTwitter /> Twitter Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                      <input
                        type="text"
                        name="social_twitter"
                        value={profile.socialLinks.twitter}
                        onChange={handleProfileChange}
                        className="input pl-8"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-2 px-8 py-3 text-lg group"
                >
                  {loading ? "Saving..." : "Save Changes"}
                  <FiSave
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>
            </form>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4 animate-fade-in">
              {recentOrders.length === 0 ?
                <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <FiShoppingBag className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                    You haven't placed any orders yet.
                  </p>
                  <button
                    onClick={() => router.push("/collections")}
                    className="btn btn-primary px-8"
                  >
                    Start Shopping
                  </button>
                </div>
              : <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                      onClick={() => router.push(`/orders/${order._id}`)}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">
                            Order #{order._id.substring(0, 8)}
                          </span>
                          <span
                            className={`badge ${
                              order.status === "delivered" ? "badge-success"
                              : order.status === "processing" ? "badge-info"
                              : order.status === "cancelled" ? "badge-error"
                              : "badge-warning"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <FiCalendar />{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                        <div className="text-left md:text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Amount
                          </p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                          <FiChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => router.push("/orders")}
                        className="btn btn-outline text-amber-600 border-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-500 dark:hover:bg-slate-800"
                      >
                        View All Orders
                      </button>
                    </div>
                  )}
                </div>
              }
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-4">
              {addresses.length === 0 ?
                <div className="text-center py-10">
                  <FiMapPin className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No addresses saved
                  </p>
                  <button
                    onClick={() => openAddressModal()}
                    className="btn btn-primary"
                  >
                    <FiPlus className="mr-2" /> Add Address
                  </button>
                </div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <span className="font-medium dark:text-white truncate">
                          {address.fullName}
                        </span>
                        {address.isDefault && (
                          <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shrink-0 text-xs">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {address.street}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <div className="flex gap-3 mt-3 pt-3 border-t">
                        <button
                          onClick={() => openAddressModal(address)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              }

              {addresses.length > 0 && (
                <button
                  onClick={() => openAddressModal()}
                  className="btn btn-outline mt-4"
                >
                  <FiPlus className="mr-2" /> Add New Address
                </button>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <form
              onSubmit={handlePasswordChange}
              className="space-y-6 max-w-md animate-fade-in bg-gray-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-slate-700"
            >
              <div className="mb-2 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Security Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update your password to stay secure.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
              >
                <FiSave size={18} />
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">
                {editingAddress ? "Edit Address" : "Add Address"}
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, fullName: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, street: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        zipCode: e.target.value,
                      })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <select
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        country: e.target.value,
                      })
                    }
                    className="input"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm dark:text-gray-300">
                  Set as default
                </span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
