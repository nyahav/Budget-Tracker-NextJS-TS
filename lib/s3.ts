import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Property } from "./types";

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