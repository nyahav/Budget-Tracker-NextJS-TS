export type TransactionType = 'income' | 'expense'

export type Timeframe ="month" |"year"

export type Period ={year:number;month:number}


export interface Property {
    id: string;
    title: string;
    price: number;
    description: string;
    imageUrl?: string;
  }

  declare global {
    namespace NodeJS {
      interface ProcessEnv {
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_REGION: string;
        S3_BUCKET: string;
      }
    }
  }
  
  export {};

