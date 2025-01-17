// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
interface Property {
  id: string;
  title: string;
  price: number;
  rooms: number;
  baths: number;
  area: number;
  coverPhoto: {
    url: string;
  };
  phoneNumber: {
    mobile: string;
  };
  location: string[];
}

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchProperties = async ( page: number, hitsPerPage: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties?purpose=for-sale&page=${page}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to fetch properties');
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
      console.log('Fetching properties for page:', page);
      const data = await fetchProperties(page, 9);
      console.log('Fetched data:', data);
      setProperties(data.hits || []);
      setTotalPages(Math.ceil(data.nbHits / 9));
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    setPage(newPage);
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
          >
            <div className="relative h-48 w-full">
              <Image
                src={property.coverPhoto?.url || "/placeholder.jpg"}
                alt={property.title}
                fill
                className="object-cover"
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

