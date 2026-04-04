import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'backend/data/products.json');

// GET /api/products/[id] - Récupérer un produit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    const product = db.products.find((p: any) => p.id === id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
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
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);

    const productIndex = db.products.findIndex((p: any) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Mettre à jour le produit
    const updatedProduct = {
      ...db.products[productIndex],
      ...body,
      id: id, // Empêcher la modification de l'ID
      updatedAt: new Date().toISOString()
    };

    db.products[productIndex] = updatedProduct;

    // Sauvegarder
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
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
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);

    const productIndex = db.products.findIndex((p: any) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Supprimer le produit
    db.products.splice(productIndex, 1);

    // Sauvegarder
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
