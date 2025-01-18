import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Property } from "../../lib/types";
import {PropertyKind} from '../../lib/types';



const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function uploadToS3(key: string, data: Property): Promise<boolean> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return false;
  }
}

export async function getFromS3(key: string): Promise<Property | null> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const data = await response.Body?.transformToString();
    return data ? JSON.parse(data) : null;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    console.error('Error fetching from S3:', error);
    throw error;
  }
}


export async function checkImageExistsInS3(propertyId: string,purpose: PropertyKind): Promise<boolean> {
  const folder = purpose === 'buy' ? 'buy' : 'rent';
  const command = new HeadObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key:  `${folder}/${propertyId}.jpg`  // Using the folder dynamically
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

export async function uploadImageToS3(propertyId: string, imageUrl: string, purpose: PropertyKind): Promise<boolean> {
  try {
    console.log('Starting image upload to S3:', { propertyId, purpose });
    
    // Fetch image from URL
    console.log('Fetching image from:', imageUrl);
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status);
      return false;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('Image fetched, size:', imageBuffer.byteLength);

    const folder = purpose === 'buy' ? 'buy' : 'rent';
    const key = `${folder}/${propertyId}.jpg`;
    
    console.log('Uploading to S3:', {
      bucket: process.env.S3_BUCKET,
      key: key
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Buffer.from(imageBuffer),
      ContentType: 'image/jpeg'
    });

    const result = await s3Client.send(command);
    console.log('Upload complete:', result);
    return true;

  } catch (error) {
    console.error('Error in uploadImageToS3:', error);
    return false;
  }
}