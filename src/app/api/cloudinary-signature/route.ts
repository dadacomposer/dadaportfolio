import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure using potential sources
const config = cloudinary.config();
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || config.cloud_name;
const apiKey = process.env.CLOUDINARY_API_KEY || config.api_key;
const apiSecret = process.env.CLOUDINARY_API_SECRET || config.api_secret;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(req: Request) {
  try {
    const { params } = await req.json();
    if (!params) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        error: 'Cloudinary environment variables (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured on Vercel. Please set them in your Vercel project settings.'
      }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      ...params,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: apiKey,
      cloudName: cloudName,
    });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
