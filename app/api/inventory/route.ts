import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  InventoryResponse, 
  InventoryUpdateRequest, 
  InventoryQueryParams,
  InventoryWithStockLevel,
  InventoryStock,
  StockLevel 
} from '@/types/inventory';

const prisma = new PrismaClient();

// Helper function to calculate stock level
function calculateStockLevel(stock: { quantity: number; reserved: number; min_stock: number; max_stock: number | null }): StockLevel {
  const availableQuantity = stock.quantity - stock.reserved;
  
  if (availableQuantity <= 0) {
    return {
      status: 'out_of_stock',
      message: 'Out of stock',
      availableQuantity,
      reservedQuantity: stock.reserved,
      minStock: stock.min_stock,
      maxStock: stock.max_stock
    };
  }
  
  if (availableQuantity <= stock.min_stock) {
    return {
      status: 'low_stock',
      message: 'Low stock - reorder needed',
      availableQuantity,
      reservedQuantity: stock.reserved,
      minStock: stock.min_stock,
      maxStock: stock.max_stock
    };
  }
  
  if (stock.max_stock && availableQuantity >= stock.max_stock) {
    return {
      status: 'overstocked',
      message: 'Overstocked',
      availableQuantity,
      reservedQuantity: stock.reserved,
      minStock: stock.min_stock,
      maxStock: stock.max_stock
    };
  }
  
  return {
    status: 'in_stock',
    message: 'In stock',
    availableQuantity,
    reservedQuantity: stock.reserved,
    minStock: stock.min_stock,
    maxStock: stock.max_stock
  };
}

// GET endpoint to retrieve product inventory/stock data
export async function GET(request: NextRequest): Promise<NextResponse<InventoryResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const sku = searchParams.get('sku');
    const includeProduct = searchParams.get('includeProduct') === 'true';
    const includeStockLevel = searchParams.get('includeStockLevel') === 'true';

    // Validate productId if provided
    if (productId && isNaN(parseInt(productId))) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    let whereClause: Record<string, unknown> = {};

    if (productId) {
      whereClause.product_id = parseInt(productId);
    }

    if (sku) {
      whereClause.sku = sku;
    }

    const inventoryData = await prisma.product_stock.findMany({
      where: whereClause,
      include: includeProduct ? {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            is_active: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      } : undefined,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Add stock level information if requested
    let enrichedData: InventoryStock[] | InventoryWithStockLevel[] = inventoryData;
    if (includeStockLevel) {
      enrichedData = inventoryData.map((stock): InventoryWithStockLevel => ({
        ...stock,
        stockLevel: calculateStockLevel(stock)
      }));
    }

    return NextResponse.json({
      success: true,
      data: enrichedData,
      count: enrichedData.length
    });

  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to update product stock values
export async function PUT(request: NextRequest): Promise<NextResponse<InventoryResponse>> {
  try {
    const body: InventoryUpdateRequest = await request.json();
    const { 
      productId, 
      sku, 
      quantity, 
      reserved, 
      minStock, 
      maxStock, 
      location, 
      batchNumber, 
      expiryDate, 
      costPrice 
    } = body;

    // Validate required fields
    if (!productId || isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Valid product ID is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    if (reserved !== undefined && (isNaN(reserved) || reserved < 0)) {
      return NextResponse.json(
        { success: false, error: 'Reserved quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    if (minStock !== undefined && (isNaN(minStock) || minStock < 0)) {
      return NextResponse.json(
        { success: false, error: 'Minimum stock must be a non-negative number' },
        { status: 400 }
      );
    }

    if (maxStock !== undefined && (isNaN(maxStock) || maxStock < 0)) {
      return NextResponse.json(
        { success: false, error: 'Maximum stock must be a non-negative number' },
        { status: 400 }
      );
    }

    if (costPrice !== undefined && (isNaN(costPrice) || costPrice < 0)) {
      return NextResponse.json(
        { success: false, error: 'Cost price must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate date format
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return NextResponse.json(
        { success: false, error: 'Invalid expiry date format' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date()
    };

    if (quantity !== undefined) updateData.quantity = quantity;
    if (reserved !== undefined) updateData.reserved = reserved;
    if (minStock !== undefined) updateData.min_stock = minStock;
    if (maxStock !== undefined) updateData.max_stock = maxStock;
    if (location !== undefined) updateData.location = location;
    if (batchNumber !== undefined) updateData.batch_number = batchNumber;
    if (expiryDate !== undefined) updateData.expiry_date = expiryDate ? new Date(expiryDate) : null;
    if (costPrice !== undefined) updateData.cost_price = costPrice;

    let stockRecord;

    if (sku) {
      // Update existing stock record by SKU
      stockRecord = await prisma.product_stock.upsert({
        where: {
          product_id_sku: {
            product_id: productId,
            sku: sku
          }
        },
        update: updateData,
        create: {
          product_id: productId,
          sku: sku,
          quantity: quantity || 0,
          reserved: reserved || 0,
          min_stock: minStock || 0,
          max_stock: maxStock || null,
          location: location || null,
          batch_number: batchNumber || null,
          expiry_date: expiryDate ? new Date(expiryDate) : null,
          cost_price: costPrice || null,
          created_at: new Date(),
          updated_at: new Date()
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true
            }
          }
        }
      });
    } else {
      // Find existing stock record for the product
      const existingStock = await prisma.product_stock.findFirst({
        where: { product_id: productId }
      });

      if (existingStock) {
        // Update existing record
        stockRecord = await prisma.product_stock.update({
          where: { id: existingStock.id },
          data: updateData,
          include: {
            products: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true
              }
            }
          }
        });
      } else {
        // Create new stock record
        stockRecord = await prisma.product_stock.create({
          data: {
            product_id: productId,
            sku: product.sku || `STOCK-${productId}`,
            quantity: quantity || 0,
            reserved: reserved || 0,
            min_stock: minStock || 0,
            max_stock: maxStock || null,
            location: location || null,
            batch_number: batchNumber || null,
            expiry_date: expiryDate ? new Date(expiryDate) : null,
            cost_price: costPrice || null,
            created_at: new Date(),
            updated_at: new Date()
          },
          include: {
            products: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true
              }
            }
          }
        });
      }
    }

    // Also update the main product's available quantity if quantity is provided
    if (quantity !== undefined) {
      await prisma.products.update({
        where: { id: productId },
        data: { available: quantity }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      data: stockRecord as InventoryStock
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update stock',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
