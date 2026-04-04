import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'backend/data/products.json');

// GET /api/products - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    // Lire le fichier de base de données
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    let products = db.products;

    // Filtrer par catégorie
    if (category && category !== 'all') {
      products = products.filter((p: any) => p.category === category);
    }

    // Filtrer les produits vedettes
    if (featured === 'true') {
      products = products.filter((p: any) => p.featured === true);
    }

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
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
    const { name, description, price, category, stock, image, featured } = body;

    // Validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Lire le fichier de base de données
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data);

    // Créer le nouveau produit
    const newProduct = {
      id: String(Date.now()),
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      image: image || null,
      featured: featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter à la base de données
    db.products.push(newProduct);

    // Sauvegarder
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({
      success: true,
      data: newProduct
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
