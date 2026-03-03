import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { verifyToken } from "@/lib/utils";

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

    if (user.role === "admin") {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page")) || 1;
      const limit = parseInt(searchParams.get("limit")) || 20;
      const search = searchParams.get("search");

      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .sort("-createdAt")
          .skip(skip)
          .limit(limit),
        User.countDocuments(query),
      ]);

      return NextResponse.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } else {
      const userData = await User.findById(user.userId).select("-password");
      return NextResponse.json({ user: userData });
    }
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authUser = verifyToken(token);
    if (!authUser) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id, ...data } = await request.json();

    if (authUser.role === "admin" && id) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { returnDocument: 'after' },
      ).select("-password");

      return NextResponse.json(updatedUser);
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        authUser.userId,
        { ...data, updatedAt: new Date() },
        { returnDocument: 'after' },
      ).select("-password");

      return NextResponse.json(updatedUser);
    }
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 },
    );
  }
}
