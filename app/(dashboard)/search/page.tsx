"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const searchSchema = z.object({
  dealType: z.enum(['rent', 'forsale']),
  settlement: z.string().min(2),
  minPrice: z.string().transform(Number),
  maxPrice: z.string().transform(Number),
})

type SearchFormValues = z.infer<typeof searchSchema>

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      dealType: 'rent',
      settlement: '',
      minPrice: 0,
      maxPrice: 1000000,
    },
  })

  async function onSubmit(data: SearchFormValues) {
    try {
      setIsLoading(true)
      console.log('Search initiated with params:', data)

      const searchParams = new URLSearchParams({
        dealType: data.dealType,
        settlement: data.settlement,
        minPrice: data.minPrice.toString(),
        maxPrice: data.maxPrice.toString(),
        page: '1',
      })

      console.log('Fetching from API with params:', searchParams.toString())
      
      const response = await fetch(`/api/scraper/search?${searchParams}`)
      const searchResults = await response.json()
      
      console.log('Search results:', searchResults)

      if (!response.ok) {
        throw new Error(searchResults.message || 'Search failed')
      }

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Real-Estate Search using Yad2</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="dealType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="forsale">Buy</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settlement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter minimum price" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter maximum price" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Form>
    </div>
  )
}