'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DBProperty, dbToApiProperty, Property } from '@/lib/propertyType';
import placeholderImage from '@/public/placeholder.jpg';


export default function SearchPage() {
  const [properties, setProperties] = useState<Partial<Property>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Partial<Property> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialTotalPages, setInitialTotalPages] = useState(0);
  const [noMoreProperties, setNoMoreProperties] = useState(false);
  const purpose = 'for-sale';
  const HITS_PER_PAGE = 9;

  const loadProperties = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null); 
      console.log('Loading properties for page:', pageNumber);
      const response = await fetch(
        `/api/properties?purpose=${purpose}&page=${pageNumber}&hitsPerPage=${HITS_PER_PAGE}`
      );

      const data = await response.json();
      if (!data.hits || data.hits.length === 0) {
        setNoMoreProperties(true);
        return;
      }
      // Convert the database properties to API format
      const convertedProperties = data.hits.map((dbProperty: DBProperty) => 
        dbToApiProperty(dbProperty)
      );
      
      setProperties(convertedProperties);
      setNoMoreProperties(false);
      console.log('Properties:', convertedProperties);
      
      // if (currentPage === 1) {
      //   setInitialTotalPages(Math.ceil(data.total / HITS_PER_PAGE));
      // }
    } catch (err) {
      console.error('Error:', err);
      // Check if the error is due to no more properties
      if ((err as Error).message.includes('no properties found')) {
        setNoMoreProperties(true);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProperties(currentPage);
  }, [currentPage]);


  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    console.log('Total Pages:', totalPages);
    if (newPage < 1 ) {
        console.log ('Invalid page number:', newPage);
        return;
    }
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (property: Partial<Property>) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

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
                    alt={property.title ?? ''}
                    unoptimized
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.log('Image load error:', e);
                      e.currentTarget.src = placeholderImage.src;
                    }}
                  />
                </div>
                <div className="flex flex-col flex-grow justify-between">
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{property.title}</h3>
                  <p className="text-green-700 font-semibold mb-2">
                    AED {(property.price ?? 0).toLocaleString()}
                  </p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{property.rooms} Rooms</span>
                    <span>{property.baths} Baths</span>
                    <span>{((property.area ?? 0).toFixed(0))} sqft</span>
                  </div>
                </div>
                </div>
              </div>
            ))}
            </div>

              {/* Always show pagination if there are properties */}
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className={`px-4 py-2 rounded ${currentPage === 1 || loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                  Previous
                </button>

                <span className="px-4 py-2">Page {currentPage}</span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={noMoreProperties || loading}
                  className={`px-4 py-2 rounded ${noMoreProperties || loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                  Next
                </button>
              </div>

              {/* No More Properties Message */}
              {noMoreProperties && (
                <div className="text-center mt-8 p-4 bg-gray-100 rounded">
                  <p className="text-gray-600">No more properties to display</p>
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
                      alt={selectedProperty.title ?? ''}
                      unoptimized
                      fill
                      className="object-cover rounded-lg"
                      onError={(e) => {
                        console.log('Image load error:', e);
                        e.currentTarget.src = placeholderImage.src;
                      }}
                    />
                  </div>
                  <p className="text-green-700 font-semibold text-lg">
                    AED {(selectedProperty.price ?? 0).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-gray-500">
                    <div>
                      <span className="font-bold">Rooms:</span> {selectedProperty.rooms}
                    </div>
                    <div>
                      <span className="font-bold">Baths:</span> {selectedProperty.baths}
                    </div>
                    <div>
                      <span className="font-bold">Area:</span> {(selectedProperty.area ?? 0).toFixed(0)} sqft
                    </div>
                    { Array.isArray(selectedProperty.amenities)  && (
                    <div>
                      <span className="font-semibold">Amenities:</span> {(selectedProperty.amenities ?? []).map((amenity) => amenity).join(', ')} 
                    </div> )}
                    { selectedProperty.phoneNumber && (
                    <div>
                        <span className="font-semibold">Contact:</span> {selectedProperty.contactName} ({selectedProperty.phoneNumber.mobile})
                    </div>
                     )}
                     { selectedProperty.description && (
                    <div>
                        <span className="font-semibold">Description:</span> {selectedProperty.description} 
                    </div>
                     )}
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