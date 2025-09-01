import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Type definitions
interface User {
  id: number;
  google_id: string;
}

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  is_stone: number;
  is_service: number;
  carats: number | null;
  product_name: string;
  unit_price: number;
}

interface Service {
  id: number;
  slug: string;
}

interface DatabaseResult {
  affectedRows: number;
}

// GET handler to fetch cart items
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        authenticated: false,
        redirectUrl: '/signin?redirect=cart'
      }, { status: 401 });
    }
    
    const userGoogleId = session.user.id;
    const connection = await pool.getConnection();
    
    try {
      // First get the internal user ID by Google ID
      const [userResult] = await connection.query(
        'SELECT id FROM users WHERE google_id = ?',
        [userGoogleId]
      );
      
      if ((userResult as User[]).length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = (userResult as User[])[0].id;
      
      // Get cart items for the user with product details
      const [rows] = await connection.query(
        `SELECT c.*, 
          CASE 
            WHEN c.is_stone = 1 THEN s.name
            WHEN c.is_service = 1 THEN srv.title_en
            ELSE p.name
          END as product_name,
          CASE 
            WHEN c.is_stone = 1 THEN s.price_per_carat
            WHEN c.is_service = 1 THEN srv.price
            ELSE p.price
          END as unit_price,
          CASE 
            WHEN c.is_stone = 1 THEN NULL
            WHEN c.is_service = 1 THEN (
              SELECT sm.media_url FROM service_media sm 
              WHERE sm.service_id = c.product_id AND sm.is_active = 1 
              ORDER BY sm.is_primary DESC, sm.sort_order ASC LIMIT 1
            )
            ELSE (
              SELECT pm.url FROM product_media pm 
              WHERE pm.product_id = c.product_id 
              ORDER BY pm.sort_order ASC LIMIT 1
            )
          END as image_url
        FROM cart c
        LEFT JOIN products p ON c.product_id = p.id AND c.is_stone = 0 AND c.is_service = 0
        LEFT JOIN stones s ON c.product_id = s.id AND c.is_stone = 1 AND c.is_service = 0
        LEFT JOIN services srv ON c.product_id = srv.id AND c.is_service = 1
        WHERE c.user_id = ?`,
        [userId]
      );
      
      return NextResponse.json({ cartItems: rows });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
  }
}

// POST handler to add item to cart
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        authenticated: false,
        redirectUrl: '/signin?redirect=cart'
      }, { status: 401 });
    }
    
    const userGoogleId = session.user.id;
    const body = await req.json();
    const { productId, quantity = 1, isStone = false, isService = false, carats, itemType } = body;
    
    // Validate required fields
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Get the internal user ID by Google ID
      const [userResult] = await connection.query(
        'SELECT id FROM users WHERE google_id = ?',
        [userGoogleId]
      );
      
      if ((userResult as User[]).length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = (userResult as User[])[0].id;
      
      // Determine the type of item and get the actual numeric ID
      let actualProductId: number;
      let resolvedIsService = isService;
      let resolvedIsStone = isStone;
      
      // If itemType is specified explicitly, use it to determine the type
      if (itemType) {
        resolvedIsService = itemType === 'service';
        resolvedIsStone = itemType === 'stone';
      }
      
      // Handle string IDs (slugs) for services
      if (resolvedIsService && typeof productId === 'string') {
        // Check if it's already a numeric ID
        if (/^\d+$/.test(productId)) {
          actualProductId = parseInt(productId, 10);
        } else {
          // It's a slug, look up the actual ID
          const [serviceResult] = await connection.query(
            'SELECT id FROM services WHERE slug = ?',
            [productId]
          );
          
          if ((serviceResult as Service[]).length === 0) {
            return NextResponse.json({ error: `Service not found with slug: ${productId}` }, { status: 404 });
          }
          
          actualProductId = (serviceResult as Service[])[0].id;
        }
      } 
      // Handle numeric IDs for regular products and stones
      else {
        // If productId is a string but looks like a number, convert it
        if (typeof productId === 'string' && /^\d+$/.test(productId)) {
          actualProductId = parseInt(productId, 10);
        } 
        // If it's already a number, use it directly
        else if (typeof productId === 'number') {
          actualProductId = productId;
        }
        // Otherwise, it's an invalid ID format
        else {
          return NextResponse.json({ 
            error: `Invalid product ID format: ${productId}. Must be numeric for products and stones.` 
          }, { status: 400 });
        }
      }
      
      // Debug logging
      console.log(`Adding item: ID=${actualProductId}, isService=${resolvedIsService}, isStone=${resolvedIsStone}`);
      
      // Check if the item already exists in the cart
      const [existingItems] = await connection.query(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND is_stone = ? AND is_service = ?',
        [userId, actualProductId, resolvedIsStone ? 1 : 0, resolvedIsService ? 1 : 0]
      );
      
      if ((existingItems as CartItem[]).length > 0) {
        // Update quantity/carats if item already exists
        const existingItem = (existingItems as CartItem[])[0];
        const newQuantity = resolvedIsStone 
          ? (existingItem.carats || 0) + (carats || 1)
          : existingItem.quantity + quantity;
          
        await connection.query(
          'UPDATE cart SET quantity = ?, carats = ? WHERE id = ?',
          [resolvedIsStone ? 1 : newQuantity, resolvedIsStone ? newQuantity : null, existingItem.id]
        );
      } else {
        // Insert new cart item
        await connection.query(
          'INSERT INTO cart (user_id, product_id, quantity, is_stone, is_service, carats) VALUES (?, ?, ?, ?, ?, ?)',
          [
            userId, 
            actualProductId, 
            resolvedIsStone ? 1 : quantity, 
            resolvedIsStone ? 1 : 0, 
            resolvedIsService ? 1 : 0,
            resolvedIsStone ? carats : null
          ]
        );
      }
      
      return NextResponse.json({ message: 'Item added to cart successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json({ 
      error: 'Failed to add item to cart', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE handler to remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        authenticated: false,
        redirectUrl: '/signin?redirect=cart'
      }, { status: 401 });
    }
    
    const userGoogleId = session.user.id;
    
    // Get cart item ID from query params
    const url = new URL(req.url);
    const cartItemId = url.searchParams.get('id');
    
    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First get the internal user ID by Google ID
      const [userResult] = await connection.query(
        'SELECT id FROM users WHERE google_id = ?',
        [userGoogleId]
      );
      
      if ((userResult as User[]).length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = (userResult as User[])[0].id;
      
      // Delete the cart item (ensuring it belongs to the correct user)
      const [result] = await connection.query(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
      );
      
      if ((result as DatabaseResult).affectedRows === 0) {
        return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Item removed from cart successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}

// PUT handler to update cart item quantity/carats
export async function PUT(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        authenticated: false,
        redirectUrl: '/signin?redirect=cart'
      }, { status: 401 });
    }
    
    const userGoogleId = session.user.id;
    const body = await req.json();
    const { cartItemId, quantity, carats } = body;
    
    // Validate required fields
    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 });
    }
    
    if (quantity === undefined && carats === undefined) {
      return NextResponse.json({ error: 'Quantity or carats must be provided' }, { status: 400 });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First get the internal user ID by Google ID
      const [userResult] = await connection.query(
        'SELECT id FROM users WHERE google_id = ?',
        [userGoogleId]
      );
      
      if ((userResult as User[]).length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = (userResult as User[])[0].id;
      
      // Get the cart item to check if it's a stone, service, or regular product
      const [cartItems] = await connection.query(
        'SELECT * FROM cart WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
      );
      
      if ((cartItems as CartItem[]).length === 0) {
        return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
      }
      
      const cartItem = (cartItems as CartItem[])[0];
      const isStone = cartItem.is_stone === 1;
      
      // Update the cart item
      await connection.query(
        'UPDATE cart SET quantity = ?, carats = ? WHERE id = ? AND user_id = ?',
        [
          isStone ? 1 : (quantity || cartItem.quantity), 
          isStone ? (carats || cartItem.carats) : null, 
          cartItemId, 
          userId
        ]
      );
      
      return NextResponse.json({ message: 'Cart item updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}