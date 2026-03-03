import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { verifyToken } from "@/lib/utils";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const orderNumber = searchParams.get("orderNumber");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = {};

    if (user.role !== "admin") {
      query.userId = user.userId;
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: "i" };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode,
      total,
      isGuestOrder,
      guestEmail,
    } = await request.json();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    let userId = null;

    if (token && !isGuestOrder) {
      const user = verifyToken(token);
      if (user) {
        userId = user.userId;
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      userId,
      orderNumber,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode,
      total,
      isGuestOrder: isGuestOrder || false,
      guestEmail: guestEmail || (isGuestOrder ? shippingAddress.email : null),
      status: "pending",
    });

    const emailTo = isGuestOrder ? guestEmail || shippingAddress.email : shippingAddress.email;
    if (emailTo) {
      sendOrderConfirmation(emailTo, order).catch(err => console.error('Failed to send confirmation email:', err));
    }

    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 },
    );
  }
}
