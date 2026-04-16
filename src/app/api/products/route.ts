import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// GET /api/products - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    const where: any = {
      isActive: true,
    };

    // Filtrer par catégorie
    if (category && category !== 'all') {
      where.category = category;
    }

    // Filtrer les produits vedettes
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      sku: product.sku,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
      price: Number(product.sellingPrice), // Alias for compatibility with store page
      currency: product.currency,
      currentStock: product.currentStock,
      stock: product.currentStock, // Alias for compatibility with store page
      minStock: product.minStock,
      maxStock: product.maxStock,
      reorderPoint: product.reorderPoint,
      supplierId: product.supplierId,
      images: product.images,
      thumbnail: product.thumbnail,
      image: product.thumbnail || (product.images && product.images[0]) || null, // Alias for compatibility
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      featured: product.isFeatured, // Alias for compatibility with store page
      specifications: product.specifications,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Generate slug from name
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('Error reading products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || null,
        category: body.category,
        subcategory: body.subcategory || null,
        brand: body.brand || null,
        sku: body.sku || null,
        costPrice: body.costPrice || 0,
        sellingPrice: body.sellingPrice || 0,
        currentStock: body.currentStock || 0,
        minStock: body.minStock || 5,
        maxStock: body.maxStock || 50,
        reorderPoint: body.reorderPoint || 10,
        images: body.images || [],
        thumbnail: body.thumbnail || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isFeatured: body.isFeatured || false,
        specifications: body.specifications || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        subcategory: newProduct.subcategory,
        brand: newProduct.brand,
        sku: newProduct.sku,
        costPrice: Number(newProduct.costPrice),
        sellingPrice: Number(newProduct.sellingPrice),
        price: Number(newProduct.sellingPrice), // Alias for compatibility
        currency: newProduct.currency,
        currentStock: newProduct.currentStock,
        stock: newProduct.currentStock, // Alias for compatibility
        minStock: newProduct.minStock,
        maxStock: newProduct.maxStock,
        reorderPoint: newProduct.reorderPoint,
        supplierId: newProduct.supplierId,
        images: newProduct.images,
        thumbnail: newProduct.thumbnail,
        image: newProduct.thumbnail || (newProduct.images && newProduct.images[0]) || null, // Alias
        isActive: newProduct.isActive,
        isFeatured: newProduct.isFeatured,
        featured: newProduct.isFeatured, // Alias
        specifications: newProduct.specifications,
        slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
