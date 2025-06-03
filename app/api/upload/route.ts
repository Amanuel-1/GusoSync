import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary using CLOUDINARY_URL environment variable
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
  secure: true
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Convert File to ArrayBuffer, then to Buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString('base64')}`,
      {
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET, // Use the upload preset
      }
    );

    if (result && result.secure_url) {
      return NextResponse.json({ success: true, photoUrl: result.secure_url });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to upload photo to Cloudinary' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Cloudinary upload API error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error uploading photo' }, { status: 500 });
  }
}
