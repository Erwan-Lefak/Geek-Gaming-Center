/**
 * Sanity CMS Configuration
 * Headless CMS for content management
 */

import { createClient, type QueryParams } from '@sanity/client';

// Environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-01-01';

/**
 * Create Sanity client
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  stega: {
    studioUrl: '/studio',
    // TODO: Configure stega for visual editing
  },
});

/**
 * Fetch data from Sanity with GROQ
 */
export async function fetchSanity<T>(
  query: string,
  params?: QueryParams
): Promise<T> {
  return await sanityClient.fetch<T>(query, params || {}, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
}

/**
 * Fetch data with ISR (Incremental Static Regeneration)
 */
export async function fetchSanityWithISR<T>(
  query: string,
  params?: QueryParams,
  revalidate = 3600 // 1 hour default
): Promise<T> {
  return await sanityClient.fetch<T>(query, params || {}, {
    next: { revalidate, tags: ['sanity'] },
  });
}

/**
 * Product queries
 */
export const productQueries = {
  getAll: `
    *[_type == "product"] | order(featured desc, name asc) {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      category,
      images,
      thumbnail,
      stock,
      sku,
      specifications,
      tags,
      featured,
      "imageUrl": thumbnail.asset->url
    }
  `,

  getBySlug: (slug: string) => `
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      category,
      images[],
      thumbnail,
      stock,
      sku,
      specifications,
      tags,
      featured,
      relatedProducts[]->{
        _id,
        name,
        slug,
        thumbnail,
        price
      }
    }
  `,

  getFeatured: `
    *[_type == "product" && featured == true][0...6] | order(name asc) {
      _id,
      name,
      slug,
      description,
      price,
      thumbnail,
      category,
      "imageUrl": thumbnail.asset->url
    }
  `,

  getByCategory: (category: string) => `
    *[_type == "product" && category == $category] | order(name asc) {
      _id,
      name,
      slug,
      description,
      price,
      thumbnail,
      category,
      stock,
      "imageUrl": thumbnail.asset->url
    }
  `,
};

/**
 * Page queries
 */
export const pageQueries = {
  getBySlug: (slug: string) => `
    *[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      seoTitle,
      seoDescription,
      content[]{
        ...,
        _type == "heroBlock" => {
          ...,
          "imageUrl": image.asset->url
        },
        _type == "imageBlock" => {
          ...,
          "imageUrl": image.asset->url
        }
      }
    }
  `,
};
