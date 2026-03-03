import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
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
    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const price = parseFloat(formData.get("price"));
    const comparePrice = parseFloat(formData.get("comparePrice")) || 0;
    const categoryId = formData.get("category");
    const subCategory = formData.get("subCategory");
    const sizes =
      formData.get("sizes") ? JSON.parse(formData.get("sizes")) : [];
    const colors =
      formData.get("colors") ? JSON.parse(formData.get("colors")) : [];
    const stock = parseInt(formData.get("stock")) || 0;
    const brand = formData.get("brand") || "";
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags")) : [];
    const bestSeller = formData.get("bestSeller") === "true";
    const featured = formData.get("featured") === "true";
    const newArrival = formData.get("newArrival") === "true";

    const images = [];
    for (let i = 1; i <= 4; i++) {
      const image = formData.get(`image${i}`);
      if (image) {
        images.push(image);
      }
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 400 },
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { message: "Product with this name already exists" },
        { status: 400 },
      );
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      comparePrice,
      images,
      category: categoryId,
      subCategory,
      sizes,
      colors,
      stock,
      brand,
      tags,
      bestSeller,
      featured,
      newArrival,
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add product error:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
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
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
