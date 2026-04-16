import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// GET /api/products/[id] - Récupérer un produit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        sku: product.sku,
        costPrice: Number(product.costPrice),
        sellingPrice: Number(product.sellingPrice),
        currency: product.currency,
        currentStock: product.currentStock,
        minStock: product.minStock,
        maxStock: product.maxStock,
        reorderPoint: product.reorderPoint,
        supplierId: product.supplierId,
        images: product.images,
        thumbnail: product.thumbnail,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        specifications: product.specifications,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
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
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        subcategory: updatedProduct.subcategory,
        brand: updatedProduct.brand,
        sku: updatedProduct.sku,
        costPrice: Number(updatedProduct.costPrice),
        sellingPrice: Number(updatedProduct.sellingPrice),
        currency: updatedProduct.currency,
        currentStock: updatedProduct.currentStock,
        minStock: updatedProduct.minStock,
        maxStock: updatedProduct.maxStock,
        reorderPoint: updatedProduct.reorderPoint,
        supplierId: updatedProduct.supplierId,
        images: updatedProduct.images,
        thumbnail: updatedProduct.thumbnail,
        isActive: updatedProduct.isActive,
        isFeatured: updatedProduct.isFeatured,
        specifications: updatedProduct.specifications,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      }
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
