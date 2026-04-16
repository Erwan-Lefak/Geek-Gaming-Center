import { NextRequest, NextResponse } from 'next/server';

// POST /api/upload - Upload multiple files (returns data URIs for Vercel compatibility)
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

      // Convert file to base64 data URI
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      // Add to uploaded files array
      uploadedFiles.push({
        name: file.name,
        url: dataUri,
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
