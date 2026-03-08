import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { verifyToken } from "@/lib/utils";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate("category", "name slug");
    } else {
      product = await Product.findOne({ slug: id }).populate("category", "name slug");
    }

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const productId = product._id;
    await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
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

    const { id } = await params;
    const data = await request.json();

    const product = await Product.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { returnDocument: 'after' },
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
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

    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
