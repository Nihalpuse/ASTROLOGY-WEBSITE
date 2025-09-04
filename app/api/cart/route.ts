import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type definitions for cart items
interface CartItem {
  id: number;
  quantity: number;
  price: number;
  products?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    slug: string;
    product_media?: Array<{
      id: number;
      media_url: string;
      alt_text?: string;
      is_primary: boolean;
    }>;
  } | null;
  services?: {
    id: number;
    title: string;
    price: number;
    duration?: string;
    delivery_type?: string;
    service_media?: Array<{
      id: number;
      media_url: string;
      alt_text?: string;
      is_primary: boolean;
    }>;
  } | null;
}

// GET - Retrieve user's cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's active cart
    const cart = await prisma.cart.findFirst({
      where: {
        user_id: parseInt(userId),
        status: 'active'
      },
      include: {
        cart_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image_url: true,
                slug: true,
                product_media: {
                  select: {
                    id: true,
                    media_url: true,
                    alt_text: true,
                    is_primary: true
                  },
                  where: {
                    is_active: true
                  },
                  orderBy: [
                    { is_primary: 'desc' },
                    { sort_order: 'asc' }
                  ]
                }
              }
            },
            services: {
              select: {
                id: true,
                title: true,
                price: true,
                duration: true,
                delivery_type: true,
                service_media: {
                  select: {
                    id: true,
                    media_url: true,
                    alt_text: true,
                    is_primary: true
                  },
                  where: {
                    is_active: true
                  },
                  orderBy: [
                    { is_primary: 'desc' },
                    { sort_order: 'asc' }
                  ]
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      // Create a new cart if none exists
      const newCart = await prisma.cart.create({
        data: {
          user_id: parseInt(userId),
          status: 'active'
        },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image_url: true,
                  slug: true,
                  product_media: {
                    select: {
                      id: true,
                      media_url: true,
                      alt_text: true,
                      is_primary: true
                    },
                    where: {
                      is_active: true
                    },
                    orderBy: [
                      { is_primary: 'desc' },
                      { sort_order: 'asc' }
                    ]
                  }
                }
              },
              services: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  duration: true,
                  delivery_type: true,
                  service_media: {
                    select: {
                      id: true,
                      media_url: true,
                      alt_text: true,
                      is_primary: true
                    },
                    where: {
                      is_active: true
                    },
                    orderBy: [
                      { is_primary: 'desc' },
                      { sort_order: 'asc' }
                    ]
                  }
                }
              }
            }
          }
        }
      });

      return NextResponse.json({
        cart: newCart,
        totalItems: 0,
        totalPrice: 0
      });
    }

    // Calculate totals
    const totalItems = cart.cart_items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalPrice = cart.cart_items.reduce((sum: number, item: CartItem) => sum + (Number(item.price) * item.quantity), 0);

    return NextResponse.json({
      cart,
      totalItems,
      totalPrice: Number(totalPrice.toFixed(2))
    });

  } catch (error) {
    console.error('Error retrieving cart:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemType, productId, serviceId, quantity = 1 } = body;

    if (!userId || !itemType) {
      return NextResponse.json(
        { error: 'User ID and item type are required' },
        { status: 400 }
      );
    }

    if (itemType === 'product' && !productId) {
      return NextResponse.json(
        { error: 'Product ID is required for product items' },
        { status: 400 }
      );
    }

    if (itemType === 'service' && !serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required for service items' },
        { status: 400 }
      );
    }

    // Get or create user's active cart
    let cart = await prisma.cart.findFirst({
      where: {
        user_id: parseInt(userId),
        status: 'active'
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user_id: parseInt(userId),
          status: 'active'
        }
      });
    }

    // Get item price
    let price = 0;
    if (itemType === 'product' && productId) {
      const product = await prisma.products.findUnique({
        where: { id: productId }
      });
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      price = Number(product.price);
    } else if (itemType === 'service' && serviceId) {
      const service = await prisma.services.findUnique({
        where: { id: serviceId }
      });
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      price = Number(service.price);
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        item_type: itemType,
        product_id: productId || null,
        service_id: serviceId || null
      }
    });

    if (existingItem) {
      // Update quantity of existing item
      const updatedItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          updated_at: new Date()
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image_url: true,
              slug: true,
              product_media: {
                select: {
                  id: true,
                  media_url: true,
                  alt_text: true,
                  is_primary: true
                },
                where: {
                  is_active: true
                },
                orderBy: [
                  { is_primary: 'desc' },
                  { sort_order: 'asc' }
                ]
              }
            }
          },
          services: {
            select: {
              id: true,
              title: true,
              price: true,
              duration: true,
              delivery_type: true,
              service_media: {
                select: {
                  id: true,
                  media_url: true,
                  alt_text: true,
                  is_primary: true
                },
                where: {
                  is_active: true
                },
                orderBy: [
                  { is_primary: 'desc' },
                  { sort_order: 'asc' }
                ]
              }
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Item quantity updated in cart',
        item: updatedItem
      });
    }

    // Add new item to cart
    const newItem = await prisma.cart_items.create({
      data: {
        cart_id: cart.id,
        item_type: itemType,
        product_id: productId || null,
        service_id: serviceId || null,
        quantity,
        price,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            image_url: true,
            slug: true,
            product_media: {
              select: {
                id: true,
                media_url: true,
                alt_text: true,
                is_primary: true
              },
              where: {
                is_active: true
              },
              orderBy: [
                { is_primary: 'desc' },
                { sort_order: 'asc' }
              ]
            }
          }
        },
        services: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            delivery_type: true,
            service_media: {
              select: {
                id: true,
                media_url: true,
                alt_text: true,
                is_primary: true
              },
              where: {
                is_active: true
              },
              orderBy: [
                { is_primary: 'desc' },
                { sort_order: 'asc' }
              ]
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Item added to cart successfully',
      item: newItem
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cart_items.delete({
        where: { id: cartItemId }
      });

      return NextResponse.json({
        message: 'Item removed from cart'
      });
    }

    // Update quantity
    const updatedItem = await prisma.cart_items.update({
      where: { id: cartItemId },
      data: {
        quantity,
        updated_at: new Date()
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            image_url: true,
            slug: true,
            product_media: {
              select: {
                id: true,
                media_url: true,
                alt_text: true,
                is_primary: true
              },
              where: {
                is_active: true
              },
              orderBy: [
                { is_primary: 'desc' },
                { sort_order: 'asc' }
              ]
            }
          }
        },
        services: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            delivery_type: true,
            service_media: {
              select: {
                id: true,
                media_url: true,
                alt_text: true,
                is_primary: true
              },
              where: {
                is_active: true
              },
              orderBy: [
                { is_primary: 'desc' },
                { sort_order: 'asc' }
              ]
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Item quantity updated successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return NextResponse.json(
        { error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    await prisma.cart_items.delete({
      where: { id: parseInt(cartItemId) }
    });

    return NextResponse.json({
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
