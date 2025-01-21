import { PrismaClient } from '@prisma/client';
import OpenAI from "openai";
import { DBProperty, DBPurpose } from '@/lib/propertyType';

const VALID_PURPOSES = ['rent', 'buy'] as const;
type PropertyPurpose = typeof VALID_PURPOSES[number];

export class PropertyAIService {
    private openai: OpenAI;
    private prisma: PrismaClient;
 
    constructor() {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // Initialize Prisma client
      this.prisma = new PrismaClient();
    }

  async searchProperties(userQuery: string): Promise<{
    properties: DBProperty[];
    explanation: string;
  }> {
    try {
      console.log('[PropertyAIService] Processing query:', userQuery);

      // 1. First, analyze the user query with GPT to extract search parameters
      const searchParams = await this.analyzeQuery(userQuery);
      console.log('[PropertyAIService] Analyzed parameters:', searchParams);
      
      // 2. Build and execute database query
      const properties = await this.executeSearch(searchParams);
      
      // 3. Generate explanation of results
      const explanation = await this.explainResults(userQuery, properties, searchParams);

      return {
        properties,
        explanation
      };
    } catch (error) {
      console.error('[PropertyAIService] Error in searchProperties:', error);
      throw error;
    }
  }

  private async analyzeQuery(query: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a property search parameter extractor. Convert natural language queries into structured search parameters.
            For property purpose:
            - Words like "rent", "lease", "rental" → purpose: "rent"
            - Words like "buy", "purchase", "sale" → purpose: "buy"
            Always use lower "rent" or "buy" for the purpose field.
            
            For prices:
            - "over X" or "more than X" should set minPrice only
            - "under X" or "less than X" should set maxPrice only
            - "between X and Y" should set both minPrice and maxPrice
            - Handle price variations like "1 million", "1M", "500k", etc.`
          },
          {
            role: "user",
            content: `Convert this query into search parameters: "${query}"

Example conversions:
"properties to rent" → {"purpose": "rent"}
"houses for sale" → {"purpose": "buy"}
"rental properties under 2000" → {"purpose": "rent", "maxPrice": 2000}

Return ONLY a JSON object with any of these fields that are mentioned (explicitly or implicitly):
{
  "purpose": "buy" or "rent",
  "minPrice": number,
  "maxPrice": number,
  "minRooms": number,
  "maxRooms": number,
  "minBaths": number,
  "maxBaths": number,
  "location": string,
  "furnishingStatus": string
}`
          }
        ],
        temperature: 0.1
      });
  
      if (!completion.choices[0]?.message?.content) {
        console.log('[PropertyAIService] No content in OpenAI response');
        return {};
      }

      let response = completion.choices[0].message.content.trim();
      console.log('[PropertyAIService] Raw OpenAI response:', response);
      
      // Extract JSON using a more compatible regex approach
      let jsonContent = response;
      
      // First try to extract from markdown code blocks if present
      const codeBlockMatch = response.match(/```(?:json)?\s*([^]*?)\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      } else {
        // If no code blocks, try to find JSON-like content
        const jsonLikeMatch = response.match(/\{[^]*\}/);
        if (jsonLikeMatch) {
          jsonContent = jsonLikeMatch[0];
        }
      }
      
      console.log('[PropertyAIService] Extracted JSON content:', jsonContent);
      
      try {
        const parsedResponse = JSON.parse(jsonContent);
        if (typeof parsedResponse !== 'object' || parsedResponse === null) {
          console.log('[PropertyAIService] Invalid response format, returning empty object');
          return {};
        }

        // Validate and normalize the purpose field if present
        if (parsedResponse.purpose) {
          const normalizedPurpose = parsedResponse.purpose.toUpperCase();
          if (!VALID_PURPOSES.includes(normalizedPurpose as PropertyPurpose)) {
            console.warn(`[PropertyAIService] Invalid purpose value: ${parsedResponse.purpose}`);
            delete parsedResponse.purpose;
          } else {
            parsedResponse.purpose = normalizedPurpose;
          }
        }

        return parsedResponse;
      } catch (parseError) {
        console.error('[PropertyAIService] Error parsing JSON response:', parseError);
        return {};
      }
    } catch (error) {
      console.error('[PropertyAIService] Error analyzing query:', error);
      return {};
    }
  }


  private async executeSearch(params: any): Promise<DBProperty[]> {
    try {
      console.log('[PropertyAIService] Executing search with params:', params);
      
      if (!params || typeof params !== 'object') {
        params = {};
      }

      // Build the where clause dynamically based on params
      const where: any = {};
      
      if (params.purpose) {
        // Ensure purpose is uppercase and valid
        const normalizedPurpose = params.purpose.toUpperCase();
        if (VALID_PURPOSES.includes(normalizedPurpose as PropertyPurpose)) {
          where.purpose = normalizedPurpose;
        }
      }
      
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

      console.log('[PropertyAIService] Final where clause:', where);
  
      const properties = await this.prisma.property.findMany({
        where,
        take: 5, // Limit results
        orderBy: { createdAt: 'desc' }
      });
  
      console.log(`[PropertyAIService] Found ${properties.length} matching properties`);
      return properties;
    } catch (error) {
      console.error('[PropertyAIService] Error executing search:', error);
      throw error;
    }
  }

  private async explainResults(
    originalQuery: string,
    properties: DBProperty[],
    searchParams: any
  ): Promise<string> {
    try {
      const propertySummary = properties
        .map(p => `- ${p.rooms} bedroom ${p.purpose.toLowerCase()} property in ${p.location} for ${p.price}`)
        .join('\n');

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `
              Original search query: "${originalQuery}"
             
              Search parameters used: ${JSON.stringify(searchParams)}
             
              Found ${properties.length} properties:
              ${propertySummary}
             
              Please provide a brief, natural explanation of the search results and how they match the user's query.
              Keep the explanation concise but informative.
            `
          }
        ]
      });

      return completion.choices[0]?.message?.content ||
        'No explanation available for the search results.';
    } catch (error) {
      console.error('[PropertyAIService] Error generating explanation:', error);
      return 'Unable to generate explanation for the search results.';
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const propertyAI = new PropertyAIService();