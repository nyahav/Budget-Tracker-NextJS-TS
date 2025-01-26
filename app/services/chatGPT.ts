import { PrismaClient } from '@prisma/client';
import OpenAI from "openai";
import { DBProperty } from '@/lib/propertyType';
import { z } from "zod";

// Transaction Types based on the Zod schema
export const TransactionTypeEnum = z.enum(["income", "expense"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export interface DBTransaction {
  id: string;
  createAt: Date;
  updateAt: Date;
  amount: number;
  description?: string;
  date: Date;
  userId: string;
  type: TransactionType;
  category: string;
  categoryIcon?: string;
}
function isValidTransactionType(type: string): type is TransactionType {
    return type === "income" || type === "expense";
}
// Add a function to transform Prisma result to our type
function transformPrismaTransaction(transaction: any): DBTransaction {
    if (!isValidTransactionType(transaction.type)) {
      throw new Error(`Invalid transaction type: ${transaction.type}`);
    }
    
    return {
      ...transaction,
      type: transaction.type as TransactionType
    };
}
const VALID_PROPERTY_PURPOSES = ['rent', 'buy'] as const;
type PropertyPurpose = typeof VALID_PROPERTY_PURPOSES[number];

type SearchResult = {
  properties?: DBProperty[];
  transactions?: DBTransaction[];
  explanation?: string;
};

export class RealEstateAIService {
  private openai: OpenAI;
  private prisma: PrismaClient;
 
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.prisma = new PrismaClient();
  }
  
  async search(userQuery: string): Promise<SearchResult> {
    try {
      console.log('[RealEstateAIService] Processing query:', userQuery);

      const searchParams = await this.analyzeQuery(userQuery);
      console.log('[RealEstateAIService] Analyzed parameters:', searchParams);
      
      let result: SearchResult = { explanation: '' };
      if (!searchParams) {
        console.error('searchParams is null or undefined');
        return { explanation: 'Unable to process query' };
        }
        if (searchParams.table === 'properties') {
          result.properties = await this.searchProperties(searchParams);
        
          console.log('Found properties:', result.properties.length);
        
          if (result.properties.length > 0) {
            result.explanation = await this.explainPropertyResults(userQuery, result.properties, searchParams);
          } else {
            result.explanation = 'No properties found matching the criteria.';
          }
      } 
      else if (searchParams.table === 'transactions') {
        result.transactions = await this.searchTransactions(searchParams);
        result.explanation = await this.explainTransactionResults(userQuery, result.transactions, searchParams);
      }
      console.log('[RealEstateAIService] Final search result:', result);
      return {
        properties: result.properties || [],
        transactions: result.transactions || [],
        explanation: result.explanation || 'No results found.'
      };
    } catch (error) {
      console.error('[RealEstateAIService] Error in search:', error);
      return {
        properties: [],
        transactions: [],
        explanation: 'Error processing search query.'
      };
    }
  }

  private async analyzeQuery(query: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
            You are a natural language query processor for a real estate application that handles both properties and financial transactions.

            Properties Schema:
            {
              id: String,
              purpose: "rent" | "buy",
              title: String,
              price: Float,
              rooms: Int,
              baths: Int,
              area: Float,
              rentFrequency: String?,
              location: String,
              description: String,
              furnishingStatus: String?,
              createdAt: DateTime,
              updatedAt: DateTime,
              imageUrl: String?
            }

            Transactions Schema:
            {
              id: String,
              createdAt: DateTime,
              updatedAt: DateTime,
              amount: Float (positive, multiple of 0.01),
              description: String?,
              date: DateTime,
              userId: String,
              type: "income" | "expense",
              category: String,
              categoryIcon: String?
            }

            Property Search Scenarios:
            1. Rental searches: "apartments for rent under $2000 in downtown"
            2. Purchase searches: "houses for buy with 3+ bedrooms"
            3. Location-based: "furnished properties in manhattan"
            4. Amenity-based: "properties with 2+ bathrooms"
            5. Price range: "homes between $300k and $500k"

            Transaction Search Scenarios:
            1. Income tracking: "show my rental income from last month"
            2. Expense analysis: "maintenance expenses over $1000"
            3. Date ranges: "transactions from January to March"
            4. Category search: "all utility payments"
            5. Type filtering: "total income this year"

            Return a JSON object with:
            {
              "table": "properties" | "transactions",
              // For properties:
              "purpose"?: "rent" | "buy",
              "minPrice"?: number,
              "maxPrice"?: number,
              "minRooms"?: number,
              "maxRooms"?: number,
              "minBaths"?: number,
              "maxBaths"?: number,
              "location"?: string,
              "furnishingStatus"?: string,
              // For transactions:
              "type"?: "income" | "expense",
              "minAmount"?: number,
              "maxAmount"?: number,
              "startDate"?: string,
              "endDate"?: string,
              "category"?: string
            }`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.1
      });

      const response = completion.choices[0]?.message?.content?.trim() || '{}';
      console.log('[RealEstateAIService] Raw OpenAI Response:', response);
      if (!response || response === '{}') {
        console.error('Empty or invalid OpenAI response');
        return { table: 'properties' }; // Fallback
      }  
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('[RealEstateAIService] JSON Parse Error:', parseError);
        console.log('Problematic Content:', response);
        throw new Error('Failed to parse OpenAI response');
      }
    } catch (error) {
      console.error('[RealEstateAIService] Detailed OpenAI Error:', error);
      return { table: 'properties' }; // Fallback
    }
  }

  private async searchProperties(params: any): Promise<DBProperty[]> {
    const where: any = {};
    
    console.log("params.purpose before processing:", params.purpose);

      if (typeof params.purpose === "string") {
        const upperPurpose = params.purpose.toUpperCase();
        if (upperPurpose === "BUY" || upperPurpose === "RENT") {
          params.purpose = upperPurpose;
        }
      } else {
        console.warn("params.purpose is not a valid string:", params.purpose);
      }

      console.log("params.purpose after processing:", params.purpose);
      console.log("where after processing:", where);
    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) where.price.gte = Number(params.minPrice);
      if (params.maxPrice) where.price.lte = Number(params.maxPrice);
    }
    
    if (params.minRooms || params.maxRooms) {
      where.rooms = {};
      if (params.minRooms) where.rooms.gte = Number(params.minRooms);
      if (params.maxRooms) where.rooms.lte = Number(params.maxRooms);
    }
    
    if (params.minBaths || params.maxBaths) {
      where.baths = {};
      if (params.minBaths) where.baths.gte = Number(params.minBaths);
      if (params.maxBaths) where.baths.lte = Number(params.maxBaths);
    }
    
    if (params.location) {
      where.location = {
        contains: params.location,
        mode: 'insensitive'
      };
    }
    
    if (params.furnishingStatus) {
      where.furnishingStatus = params.furnishingStatus;
    }

    return await this.prisma.property.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  }

  private async searchTransactions(params: any): Promise<DBTransaction[]> {
    const where: any = {};
    
    if (params.type) {
      // Validate the type parameter
      if (!isValidTransactionType(params.type)) {
        throw new Error(`Invalid transaction type in params: ${params.type}`);
      }
      where.type = params.type;
    }
    
    if (params.minAmount || params.maxAmount) {
      where.amount = {};
      if (params.minAmount) where.amount.gte = Number(params.minAmount);
      if (params.maxAmount) where.amount.lte = Number(params.maxAmount);
    }
    
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = new Date(params.startDate);
      if (params.endDate) where.date.lte = new Date(params.endDate);
    }
    
    if (params.category) {
      where.category = {
        contains: params.category,
        mode: 'insensitive'
      };
    }
  
    // Get transactions from Prisma and transform them
    const transactions = await this.prisma.transaction.findMany({
      where,
      take: 10,
      orderBy: { date: 'desc' }
    });
  
    // Transform and validate each transaction
    return transactions.map(transformPrismaTransaction);
  }
  

  private async explainPropertyResults(
    query: string,
    properties: DBProperty[],
    params: Record<string, unknown>
  ): Promise<string> {
    try {
      if (!properties.length) {
        return 'No properties found matching the search criteria.';
      }
  
      const summary = properties
        .map(p => `- ${p.rooms} bedroom ${p.purpose.toLowerCase()} property in ${p.location} for $${p.price}`)
        .join('\n');
  
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `
              Query: "${query}"
              Parameters: ${JSON.stringify(params, null, 2)}
              Found ${properties.length} properties:
              ${summary}
              
              Provide a natural explanation of how these results match the search criteria.
            `
          }
        ]
      });
  
      return completion.choices[0]?.message?.content ?? 'No explanation available.';
    } catch (error) {
      console.error('Error generating property explanation:', error);
      return 'Unable to generate explanation due to an error.';
    }
  }

  private async explainTransactionResults(
    query: string,
    transactions: DBTransaction[],
    params: any
  ): Promise<string> {
    const summary = transactions
      .map(t => `- ${t.type} transaction: $${t.amount} for ${t.category} on ${t.date.toLocaleDateString()}`)
      .join('\n');
  
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `
            Query: "${query}"
            Parameters: ${JSON.stringify(params)}
            Found ${transactions.length} transactions:
            ${summary}
            
            Provide a natural explanation of these financial results, including any relevant totals or patterns.
          `
        }
      ]
    });
  
    return completion.choices[0]?.message?.content || 'No explanation available.';
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const realEstateAI = new RealEstateAIService();