import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// POST /api/upload - Upload multiple files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Validate files
    const uploadedFiles: Array<{
      name: string;
      url: string;
      size: number;
    }> = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      // Check file type (only images)
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.name);
      const filename = `${timestamp}-${randomStr}${extension}`;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to public/uploads directory
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);

      // Add to uploaded files array
      uploadedFiles.push({
        name: file.name,
        url: `/uploads/${filename}`,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
