import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const username = formData.get('username') as string;
    const image = formData.get('image') as File | null;
    const removeImage = formData.get('removeImage') === 'true';

    // Validate username
    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    if (username.length > 50) {
      return NextResponse.json({ error: 'Username must be 50 characters or less' }, { status: 400 });
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let imageUrl: string | null = currentUser.image;

    // Handle image upload
    if (image) {
      // Validate image
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json({ error: 'Invalid image type. Only JPEG, PNG, and WEBP are allowed.' }, { status: 400 });
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be less than 5MB' }, { status: 400 });
      }

      // Ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = image.name.split('.').pop();
      const fileName = `${session.user.id}-${timestamp}.${extension}`;
      const filePath = path.join(uploadDir, fileName);

      // Save new image
      const buffer = Buffer.from(await image.arrayBuffer());
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;

      // Delete old image if it exists
      if (currentUser.image) {
        const oldFileName = currentUser.image.split('/').pop();
        if (oldFileName) {
          const oldFilePath = path.join(uploadDir, oldFileName);
          try {
            await unlink(oldFilePath);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
    } else if (removeImage && currentUser.image) {
      // Handle image removal
      const oldFileName = currentUser.image.split('/').pop();
      if (oldFileName) {
        const oldFilePath = path.join(process.cwd(), 'public', 'uploads', oldFileName);
        try {
          await unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      imageUrl = null;
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: username.trim(),
        image: imageUrl,
      },
    });

    // Revalidate any cached data
    revalidatePath('/profile');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating your profile' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true },
  });

  return NextResponse.json(user);
}