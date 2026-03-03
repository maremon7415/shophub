import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/lib/models/Coupon";
import { verifyToken } from "@/lib/utils";

export async function PUT(request, { params }) {
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
    const { id } = params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 },
      );
    }

    if (body.code && body.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: body.code.toUpperCase() });
      if (existingCoupon) {
        return NextResponse.json(
          { message: "Coupon code already exists" },
          { status: 400 },
        );
      }
      body.code = body.code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json(
      { message: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
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
    const { id } = params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 },
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      { message: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
