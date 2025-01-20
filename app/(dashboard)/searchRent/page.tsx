'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pagination, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Property,DBPurpose,ApiPurpose, DBProperty } from '@/lib/propertyType';
import { propertyHandler } from '@/app/services/propertyHandler';

import placeholderImage from '@/public/placeholder.jpg';

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const purpose = 'for-rent';
  
  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/properties?purpose=${purpose}&page=${page}&hitsPerPage=9`
      );
      
      if (!response.ok) throw new Error('Failed to fetch properties');
      
      const data = await response.json();
      console.log('API Response:', {
        hits: data.hits.length,
        nbHits: data.nbHits,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      });
      
      setProperties(data.hits);
      setTotalPages(data.totalPages);
      
    } catch (err) {
      console.error('Error loading properties:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadProperties();
  }, [page, purpose]);


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
                                src={ placeholderImage.src}
                                alt={property.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    console.error('Image load error:', e);
                                    e.currentTarget.src = placeholderImage.src;
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
                                    //src={selectedProperty.coverPhoto?.url || "/placeholder.jpg"}
                                    src={ placeholderImage.src}
                                    alt={selectedProperty.title}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <p className="text-green-800">Price: AED {selectedProperty.price.toLocaleString()}</p>
                            <p className="text-white-700 justify-between w-full">
                                {selectedProperty.rooms} Rooms, {selectedProperty.baths} Baths, Area: {selectedProperty.area.toFixed(0)} sqft
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="mt-8 flex justify-center">
                <Pagination className="space-x-2">
                    {page > 1 && (
                        <PaginationPrevious
                            onClick={() => handlePageChange(page - 1)}
                            aria-label="Previous Page"
                        />
                    )}
                    {page < totalPages && (
                        <PaginationNext
                            onClick={() => handlePageChange(page + 1)}
                            aria-label="Next Page"
                        />
                    )}
                </Pagination>
            </div>
        </div>
    );
}