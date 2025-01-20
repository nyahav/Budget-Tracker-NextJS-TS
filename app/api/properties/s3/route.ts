// import { NextRequest, NextResponse } from 'next/server';
// import { checkImageExistsInS3, uploadImageToS3 } from '@/app/services/s3';
// import { PropertyKind } from '@/lib/types';

// export async function GET(request: NextRequest) {
//     const { searchParams } = new URL(request.url);
//     try {
//       const propertyId = searchParams.get('propertyId');
//       const imageUrl = searchParams.get('imageUrl');
//       const purpose = searchParams.get('purpose');
  
      
  
//       if (!propertyId || !imageUrl || !purpose) {
//         console.log('2. Missing parameters');
//         return NextResponse.json({ imageUrl });
//       }
  
//       // Check if image exists in S3
//       const exists = await checkImageExistsInS3(propertyId, purpose as PropertyKind);
//       console.log('3. Image exists:', exists);
  
//       if (!exists) {
//         console.log('5. Image does not exist, attempting upload...');
//         try {
//           const uploaded = await uploadImageToS3(propertyId, imageUrl, purpose as PropertyKind);
//           console.log('6. Upload result:', uploaded);
          
//           if (uploaded) {
//             // Double check if the upload worked
//             const existsAfterUpload = await checkImageExistsInS3(propertyId, purpose as PropertyKind);
//             console.log('7. Image exists after upload:', existsAfterUpload);
//           }
//         } catch (uploadError) {
//           console.error('Upload error:', uploadError);
//         }
//       }
  
//       // Construct final URL
//       const s3Url = exists 
//         ? `https://realestate-tracker-nextjs.s3.eu-central-1.amazonaws.com/${purpose}/${propertyId}.jpg`
//         : imageUrl;
  
      
  
//       return NextResponse.json({
//         exists,
//         imageUrl: s3Url
//       });
  
//     } catch (error) {
//       console.error('Main route error:', error);
//       return NextResponse.json({ imageUrl: searchParams.get('imageUrl') });
//     }
//   }