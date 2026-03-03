import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/lib/models/Coupon";
import { verifyToken } from "@/lib/utils";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();
    const body = await request.json();

    const existingCoupon = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon code already exists" },
        { status: 400 },
      );
    }

    const coupon = await Coupon.create({
      ...body,
      code: body.code.toUpperCase(),
      createdBy: user.id,
    });

    return NextResponse.json(
      { message: "Coupon created successfully", coupon },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      { message: "Failed to create coupon" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const query = {};

    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate("applicableCategories", "name")
        .populate("createdBy", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(query),
    ]);

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      { message: "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}
