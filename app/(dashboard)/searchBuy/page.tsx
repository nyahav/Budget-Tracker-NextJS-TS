'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Property,DBPurpose,ApiPurpose, DBProperty } from '@/lib/propertyType';


import placeholderImage from '@/public/placeholder.jpg';

export default function SearchPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1); 
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [hasMore, setHasMore] = useState(true); 
    const [initialTotalPages, setInitialTotalPages] = useState(0);
    const purpose = 'for-sale';
    const HITS_PER_PAGE = 9;

  
  const loadProperties = async (pageNumber: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/properties?purpose=${purpose}&page=${pageNumber}&hitsPerPage=${HITS_PER_PAGE}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch properties');
      
      const data = await response.json();
    //   console.log('API Response:', {
    //     hits: data.hits.length,
    //     nbHits: data.nbHits,
    //     totalPages: data.totalPages,
    //     currentPage: data.currentPage
    //   });
      
      if (currentPage === 1) {
        setInitialTotalPages(Math.ceil(data.total / HITS_PER_PAGE));
    }
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
    loadProperties(currentPage);
  }, [currentPage, purpose]);


  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    console.log('Total Pages:', totalPages);
    if (newPage < 1 || (totalPages && newPage > totalPages)) {
        console.log ('Invalid page number:', newPage);
        return;
    }
    loadProperties(newPage);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading properties...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : (
        <>
          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
                
              <div
                key={property.id}
                className="border rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-200 hover:scale-105"
                onClick={() => handleItemClick(property)}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={property.coverPhoto?.url || placeholderImage.src}
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
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{property.title}</h3>
                  <p className="text-green-700 font-semibold mb-2">
                    AED {property.price.toLocaleString()}
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

          {/* Always show pagination if there are properties */}
          {properties.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                     onClick={() => {
                        handlePageChange(currentPage - 1);
                      }}
                      className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationLink>
                      Page {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationNext
                     onClick={() => {
                        handlePageChange(currentPage + 1);
                      }}
                      className={`cursor-pointer ${!hasMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Property Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedProperty?.title}</DialogTitle>
                <DialogDescription>
                  Property Details
                </DialogDescription>
              </DialogHeader>
              {selectedProperty && (
                <div className="space-y-4">
                  <div className="relative h-64 w-full">
                    <Image
                      src={selectedProperty.coverPhoto?.url ||placeholderImage.src}
                      alt={selectedProperty.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-green-700 font-semibold text-lg">
                    AED {selectedProperty.price.toLocaleString()}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-gray-600">
                    <div>
                      <span className="font-semibold">Rooms:</span> {selectedProperty.rooms}
                    </div>
                    <div>
                      <span className="font-semibold">Baths:</span> {selectedProperty.baths}
                    </div>
                    <div>
                      <span className="font-semibold">Area:</span> {selectedProperty.area.toFixed(0)} sqft
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}