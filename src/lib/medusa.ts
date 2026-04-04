/**
 * MedusaJS Configuration
 * Headless E-commerce platform
 * TEMPORARILY DISABLED - Not used in current implementation
 */

// TODO: Implement Medusa integration when needed for backend e-commerce
// import { createClient } from '@medusajs/js-sdk';

// Environment variables
// const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
// const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

// /**
//  * Create Medusa client
//  */
// export const medusaClient = createClient({
//   baseUrl: backendUrl,
//   publishableKey,
//   debug: process.env.NODE_ENV === 'development',
// });

// Placeholder exports to prevent build errors
export const medusaClient = null;
export const products = null;
export const cart = null;
export const checkout = null;
export const regions = null;
