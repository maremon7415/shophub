import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { verifyToken } from "@/lib/utils";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const hierarchical = searchParams.get("hierarchical") === "true";

    let query = {};
    if (activeOnly) {
      query.isActive = true;
    }

    let categories = await Category.find(query)
      .populate("parentCategory", "name slug")
      .sort("order name");

    if (hierarchical) {
      const categoryMap = {};
      const rootCategories = [];

      categories.forEach((cat) => {
        categoryMap[cat._id] = { ...cat.toObject(), children: [] };
      });

      categories.forEach((cat) => {
        if (cat.parentCategory) {
          if (categoryMap[cat.parentCategory._id]) {
            categoryMap[cat.parentCategory._id].children.push(
              categoryMap[cat._id],
            );
          }
        } else {
          rootCategories.push(categoryMap[cat._id]);
        }
      });

      categories = rootCategories;
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

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
    const { name, description, image, parentCategory, isActive, order } =
      await request.json();

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category with this name already exists" },
        { status: 400 },
      );
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      isActive: isActive ?? true,
      order: order || 0,
    });

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 },
    );
  }
}
