// app/chatgpt/page.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import placeholderImage from '@/public/placeholder.jpg';
export default function ChatGPTPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{
        properties: any[];
        explanation: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chatgpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Search results:', data);
            setResults(data);
        } catch (error) {
            console.error('Error searching properties:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Title */}
            <h1 className="text-6xl font-bold text-center">AI Assistant</h1>
            {!results && (
                <div>
                    <p className="text-center text-xl text-gray-600 mt-2">
                        AI is here to help you search for your data.<br />
                        It can find properties in our database,<br />  recent information about transactions, and much more.
                    </p>
                </div>
            )}

            {/* Search Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <Input
                            className="text-lg"
                            placeholder="Enter your property search query..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                    setQuery('');
                                }
                            }}
                        />
                        <Button
                            onClick={() => {
                                handleSearch();
                                setQuery('');
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {/* Suggested Queries Section */}
            {!results && (
                <div className="mt-4">
                    <h3 className="text-2xl font-semibold mb-4">Suggested Queries:</h3>

                    {/* Property Queries Section */}
                    <div className="mb-6">
                        <h4 className="text-lg font-medium mb-2 text-gray-700">Property Searches:</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Looking to buy an apartment in the range of 500000 and 1000000",
                                "Searching for a rental property with 3 bedrooms",
                                "Looking for properties under 700000",
                                "Searching for a house with a garden and 4 bedrooms",
                            ].map((suggestion, index) => (
                                <button
                                    key={`property-${index}`}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
                                    onClick={() => setQuery(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transaction Queries Section */}
                    <div>
                        <h4 className="text-lg font-medium mb-2 text-gray-700">Transaction Searches:</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Show all income transactions from last month",
                                "Find expenses over 1000 in utilities category",
                                "Show my rental income for the past 3 months",
                                "Display all maintenance expenses this year",
                            ].map((suggestion, index) => (
                                <button
                                    key={`transaction-${index}`}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
                                    onClick={() => setQuery(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Results Section */}
            {isLoading ? (
                <div className="text-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4">Loading properties...</p>
                </div>
            ) : error ? (
                <Card className="bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            ) : results ? (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            {/* Clear Results Button */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Search Results</h3>
                                <button
                                    onClick={() => setResults(null)} // Clear results
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Clear Results
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{results.explanation}</p>

                            <div className="space-y-2">
                                {results.properties.map((property, index) => (
                                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                                        <p>
                                            {property.rooms} bedroom {property.purpose.toLowerCase()} property
                                        </p>
                                        <p className="text-gray-600">Location: {property.location}</p>
                                        <p className="text-green-600">
                                            Price: ${property.price.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}