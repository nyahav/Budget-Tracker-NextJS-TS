import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Property, PropertyKind } from "../../lib/propertyType";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
class S3Service {
  private client: S3Client;
  private bucketName = process.env.S3_BUCKET as string;
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  /**
   * Upload property data to S3
   */
  async uploadToS3(key: string, data: Property): Promise<boolean> {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return false;
    }
  }

  /**
   * Get property data from S3
   */
  async getFromS3(key: string): Promise<Property | null> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    try {
      const response = await this.client.send(command);
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

  /**
   * Check if image exists in S3
   */
  async checkImageExistsInS3(propertyId: string, purpose: PropertyKind): Promise<boolean> {
    const folder = purpose === 'buy' ? 'buy' : 'rent';
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${folder}/${propertyId}.jpg`
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload image to S3
   */
  async uploadImageToS3(propertyId: string, imageUrl: string, purpose: PropertyKind): Promise<boolean> {
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

      const result = await this.client.send(command);
      console.log('Upload complete:', result);
      return true;

    } catch (error) {
      console.error('Error in uploadImageToS3:', error);
      return false;
    }
  }
  async getImageUrl(propertyId: string, purpose: PropertyKind): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: `properties/${purpose}/${propertyId}.jpg`,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error('Error getting S3 image URL:', error);
      return '';
    }
  }
}

// Create singleton instance
export const s3 = new S3Service();

// Export class for cases where a new instance is needed
export default S3Service;