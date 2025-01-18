// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Property } from '@/lib/propertyType';

//const property = await getProperty(id);
export type PropertyPurpose = 'for-rent' | 'for-sale';

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const fetchProperties = async ( page: number, hitsPerPage: number) => {
    try {
      setLoading(true);
      const purpose: PropertyPurpose = 'for-sale';
      const response = await fetch(`/api/properties/rapidapi?purpose=${purpose}&page=${page}&hitsPerPage=${hitsPerPage}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to fetch properties!!!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Page changed to:', page);
    loadProperties();
  }, [page]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await fetchProperties(page, 9);
      console.log('Received data:', data);
      if (!data || !data.hits) {
        console.error('Invalid data structure:', data);
        setError('Invalid data received from server');
        return;
      }
      // Process each property's image
      const processedProperties = await Promise.all(
        data.hits.map(async (property: Property) => {
          try {
            console.log('Processing property:', property.id);
            console.log('Original image URL:', property.coverPhoto.url);
            
            const apiUrl = `/api/properties/s3?propertyId=${property.id}&imageUrl=${encodeURIComponent(property.coverPhoto.url)}&purpose=buy`;
            console.log('Calling S3 API:', apiUrl);
            
            const response = await fetch(apiUrl);
            const s3Data = await response.json();
            console.log('S3 API Response:', s3Data);
      
            if (s3Data.error) {
              console.error('S3 API Error:', s3Data.error);
              return property;
            }
      
            const finalUrl = s3Data.imageUrl;
            console.log('Using URL:', finalUrl);
      
            return {
              ...property,
              coverPhoto: {
                ...property.coverPhoto,
                url: finalUrl || property.coverPhoto.url
              }
            };
          } catch (err) {
            console.error('Error processing property:', property.id, err);
            return property;
          }
        })
      );
  
      setProperties(processedProperties);
      setTotalPages(Math.ceil(data.nbHits / 9));
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to fetch properties!');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    setPage(newPage);
  };

  const handleItemClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;


  // async function getProperty(id: string): Promise<Property> {
  //   // נסה להביא מ-cache
  //   const cached = await getPropertyFromCache(id);
  //   if (cached) return cached;
  
  //   // אם לא נמצא ב-cache, הבא מ-DB
  //   const property = await prisma.property.findUnique({ where: { id } });
  //   if (!property) throw new Error('Property not found');
  
  //   // הוסף ל-cache
  //   await redis.set(`property:${id}`, JSON.stringify(property));
  
  //   return property;
  // }
  return (
    <div className="container mx-auto px-4 py-8">

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="border rounded-lg overflow-hidden shadow-lg"
            onClick={() => handleItemClick(property)}
          >
            <div className="relative h-48 w-full">
              <Image
                src={property.coverPhoto?.url || "/placeholder.jpg"}
                alt={property.title}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error('Image load error:', e);
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{property.title}</h3>
              <p className="text-gray-700 mb-2">
                Price: AED {property.price.toLocaleString()}
              </p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{property.rooms} Rooms</span>
                <span>{property.baths} Baths</span>
                <span>{property.area.toFixed(0)} sqft</span>
                    </div>
                </div>
            </div>
        ))}
            </div>
            {/* Dialog for Property Details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedProperty?.title}</DialogTitle>
                        <DialogDescription>
                          Detailed information about the property.
                      </DialogDescription>
                  </DialogHeader>
                  {selectedProperty && (
                      <div className="space-y-4">
                          <div className="relative h-64 w-full">
                              <Image
                                  src={selectedProperty.coverPhoto?.url || "/placeholder.jpg"}
                                  alt={selectedProperty.title}
                                  fill
                                  className="object-cover rounded-lg"
                              />
                          </div>
                          <p className="text-green-800">Price: AED {selectedProperty.price.toLocaleString()}</p>
                          <p className="text-white-700 justify-between w-full">{selectedProperty.rooms} Rooms, {selectedProperty.baths} Baths, Area: {selectedProperty.area.toFixed(0)} sqft</p>
                          
                          
                      </div>
                  )}
              </DialogContent>
          </Dialog>

            <div className="mt-8 flex justify-center">
                <Pagination className="space-x-2">
                    {page > 1 && (
                        <PaginationPrevious
                            onClick={() => setPage(page - 1)}
                            aria-label="Previous Page"
                        />
                    )}

                    {page < totalPages && (
                        <PaginationNext
                            onClick={() => setPage(page + 1)}
                            aria-label="Next Page"
                        />
                    )}
                </Pagination>
            </div>
        </div>
    );
};

