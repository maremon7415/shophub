import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils';

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    const userData = await User.findById(user.userId);
    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    userData.password = hashedPassword;
    await userData.save();

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
