"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AnimatedStars } from '@/app/components/AnimatedStars'
import { MysticBackground } from '@/app/components/MysticBackground'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useCart } from '../contexts/CartContext'

// Database cart item structure (matching cart page)
interface DatabaseCartItem {
  id: number;
  quantity: number;
  price: number;
  products?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    slug: string;
    product_media?: {
      id: number;
      media_url: string;
      is_primary: boolean;
    }[];
  } | null;
  services?: {
    id: number;
    title: string;
    price: number;
    duration?: string;
    delivery_type?: string;
    service_media?: {
      id: number;
      media_url: string;
      is_primary: boolean;
    }[];
  } | null;
}

// Local cart item structure (from CartContext)
interface LocalCartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  quantity: number;
}

// Union type for all possible cart items
type CheckoutItem = DatabaseCartItem | LocalCartItem;

interface CartData {
  cart: {
    id: number;
    cart_items: DatabaseCartItem[];
  };
  totalItems: number;
  totalPrice: number;
}

interface AddressInfo {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { userId, isAuthenticated } = useCurrentUser()
  const { items: localItems, removeItem: removeLocalItem, updateQuantity: updateLocalQuantity, total: localTotal } = useCart()
  
  const [loading, setLoading] = useState(true)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [address, setAddress] = useState<AddressInfo>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })
  const [savedAddresses, setSavedAddresses] = useState<AddressInfo[]>([])
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [isUpdatingCart, setIsUpdatingCart] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch cart data from database (same as cart page)
        const cartRes = await fetch(`/api/cart?userId=${userId}`);
        if (cartRes.ok) {
          const data = await cartRes.json();
          setCartData(data);
        } else {
          console.error('Failed to fetch cart');
        }
        
        // Fetch saved addresses if available
        try {
          const addressRes = await fetch(`/api/user/addresses?userId=${userId}`);
          if (addressRes.ok) {
            const addressData = await addressRes.json();
            setSavedAddresses(addressData.addresses || []);
            
            // Set default address if available
            if (addressData.addresses && addressData.addresses.length > 0) {
              setAddress(addressData.addresses[0]);
            }
          }
        } catch (err) {
          console.error("Could not fetch addresses:", err);
          // Continue with checkout even if addresses can't be fetched
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load checkout information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckoutData();
  }, [userId, isAuthenticated]);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectAddress = (addressId: string) => {
    const selected = savedAddresses.find((addr, index) => index.toString() === addressId);
    if (selected) {
      setAddress(selected);
    }
  };

  const handleRemoveItem = async (cartItemId: number | string) => {
    setIsUpdatingCart(true);
    try {
      // If it's a database cart item, remove from database
      if (typeof cartItemId === 'number') {
        const response = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Refresh cart data
          if (userId) {
            const cartResponse = await fetch(`/api/cart?userId=${userId}`);
            if (cartResponse.ok) {
              const data = await cartResponse.json();
              setCartData(data);
            }
          }
          toast.success("Item removed from cart");
        }
      } else {
        // If it's a local item, remove from local state
        removeLocalItem(cartItemId);
        toast.success("Item removed from cart");
      }
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error("Failed to remove item from cart");
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: number | string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    setIsUpdatingCart(true);
    try {
      // If it's a database cart item, update in database
      if (typeof cartItemId === 'number') {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItemId,
            quantity: newQuantity,
          }),
        });

        if (response.ok) {
          // Refresh cart data
          if (userId) {
            const cartResponse = await fetch(`/api/cart?userId=${userId}`);
            if (cartResponse.ok) {
              const data = await cartResponse.json();
              setCartData(data);
            }
          }
          toast.success("Cart updated");
        }
      } else {
        // If it's a local item, update local state
        updateLocalQuantity(cartItemId, newQuantity);
        toast.success("Cart updated");
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error("Failed to update cart");
    } finally {
      setIsUpdatingCart(false);
    }
  };
  
  // Use database cart data if available, fallback to local items
  const items = cartData?.cart?.cart_items || localItems;
  const total = cartData?.totalPrice || localTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Validate address information
    const requiredFields = ['fullName', 'addressLine1', 'city', 'state', 'pincode', 'phone'];
    for (const field of requiredFields) {
      if (!address[field as keyof AddressInfo]) {
        toast.error(`Please provide your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    // Validate phone number (basic validation)
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Save the address first if API endpoint exists
      try {
        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            address: {
              fullName: address.fullName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              country: 'India',
              addressType: 'home'
            },
            setDefault: true
          }),
        });
      } catch (err) {
        console.warn("Could not save address:", err);
        // Continue with order creation even if address saving fails
      }
      
      // Check if user is authenticated and has userId
      if (!isAuthenticated || !userId) {
        toast.error("Please log in to place an order");
        router.push('/signin?redirect=checkout');
        return;
      }
      
      // Process payment based on method
      if (paymentMethod === 'online') {
        // For online payments, we still need to create the order first
        // Then redirect to payment gateway
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            shippingAddress: address,
            billingAddress: address, // Using same address for billing
            paymentMethod: 'online',
            notes: `Payment method: Online payment`
          }),
        });
        
        const orderData = await orderRes.json();
        
        if (orderData.success) {
          // Now redirect to payment gateway with order info
          const paymentRes = await fetch("/api/checkout/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              orderId: orderData.orderId,
              orderNumber: orderData.orderNumber,
              shippingAddress: address,
              billingAddress: address
            }),
          });
          
          const paymentData = await paymentRes.json();
          
          if (paymentData.redirectUrl) {
            router.push(paymentData.redirectUrl); // Handle dummy checkout redirect
          } else {
            throw new Error("Payment initialization failed");
          }
        } else {
          throw new Error("Order creation failed");
        }
      } else {
        // COD processing using new orders API
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            shippingAddress: address,
            billingAddress: address, // Using same address for billing
            paymentMethod: 'cod',
            notes: `Payment method: Cash on Delivery`
          }),
        });
        
        const data = await res.json();
        
        if (data.success) {
          toast.success("Order placed successfully!");
          router.push(`/order-confirmation/${data.orderId}`);
        } else {
          throw new Error("Order placement failed");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculateTotalPrice = (item: CheckoutItem) => {
    // Type guard to check if item is a database cart item
    const isDatabaseItem = 'products' in item || 'services' in item;
    
    if (isDatabaseItem) {
      const dbItem = item as DatabaseCartItem;
      return Number(dbItem.price) * dbItem.quantity;
    } else {
      const localItem = item as LocalCartItem;
      return Number(localItem.price) * localItem.quantity;
    }
  };
  
  const subtotal = items.reduce((sum, item) => sum + calculateTotalPrice(item), 0);
  
  return (
    <div className="text-black">
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-golden-amber-dark via-sunburst-yellow to-golden-amber-dark">
        <AnimatedStars />
        <MysticBackground>
          <div className="container mx-auto pt-32 px-4 py-16 relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-center text-mystic-brown">
            Checkout
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 text-mystic-brown">
            Review and Complete Your Order
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-xl text-mystic-brown mb-8">Your cart is empty</p>
              <Button 
                onClick={() => router.push('/shop')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Product Table with Edit Options */}
                <Card className="mb-8 bg-midnight-blue-light/80 border border-gold/30">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-serif font-semibold mb-6 text-gold">Review Your Items</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-lavender">Product</TableHead>
                            <TableHead className="text-lavender text-right">Price</TableHead>
                            <TableHead className="text-lavender text-center">Quantity</TableHead>
                            <TableHead className="text-lavender text-right">Total</TableHead>
                            <TableHead className="text-lavender text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => {
                            // Type guard to check if item is a database cart item
                            const isDatabaseItem = 'products' in item || 'services' in item;
                            
                            // Handle both database cart items and local items
                            const itemName = isDatabaseItem 
                              ? (item as DatabaseCartItem).products?.name || (item as DatabaseCartItem).services?.title
                              : (item as LocalCartItem).name;
                            
                            const itemPrice = isDatabaseItem
                              ? (item as DatabaseCartItem).products?.price || (item as DatabaseCartItem).services?.price
                              : (item as LocalCartItem).price;
                            
                            const itemId = item.id;
                            const itemQuantity = item.quantity;

                            return (
                              <TableRow key={itemId}>
                                <TableCell className="text-lavender font-medium">
                                  {itemName || 'Unnamed Item'}
                                </TableCell>
                                <TableCell className="text-lavender text-right">
                                  ₹{Number(itemPrice).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-full bg-midnight-blue border-gold/30 text-lavender"
                                      onClick={() => handleUpdateQuantity(itemId, itemQuantity - 1)}
                                      disabled={isUpdatingCart || itemQuantity <= 1}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    
                                    <span className="text-lavender min-w-16 text-center">
                                      {itemQuantity}
                                    </span>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-full bg-midnight-blue border-gold/30 text-lavender"
                                      onClick={() => handleUpdateQuantity(itemId, itemQuantity + 1)}
                                      disabled={isUpdatingCart}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gold text-right">
                                  ₹{calculateTotalPrice(item).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-lavender hover:text-red-400 hover:bg-red-400/10"
                                    onClick={() => handleRemoveItem(itemId)}
                                    disabled={isUpdatingCart}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline"
                        className="text-lavender border-gold/30 hover:bg-gold/10"
                        onClick={() => router.push('/shop')}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <form onSubmit={handleSubmit}>
                  <Card className="mb-8 bg-midnight-blue-light/80 border border-gold/30">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-serif font-semibold mb-6 text-gold">Shipping Address</h3>
                      
                      {savedAddresses.length > 0 && (
                        <div className="mb-6">
                          <Label className="text-lavender mb-2 block">Select a saved address</Label>
                          <Select onValueChange={handleSelectAddress}>
                            <SelectTrigger className="bg-midnight-blue border-gold/30 text-lavender">
                              <SelectValue placeholder="Choose address..." />
                            </SelectTrigger>
                            <SelectContent className="bg-midnight-blue border-gold/30">
                              {savedAddresses.map((addr, index) => (
                                <SelectItem key={index} value={index.toString()} className="text-lavender hover:bg-celestial-blue/20">
                                  {addr.fullName}, {addr.addressLine1}, {addr.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-lavender">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={address.fullName}
                            onChange={handleAddressChange}
                            required
                            className="bg-midnight-blue border-gold/30 text-lavender"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-lavender">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={address.phone}
                            onChange={handleAddressChange}
                            required
                            className="bg-midnight-blue border-gold/30 text-lavender"
                            placeholder="10-digit mobile number"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="addressLine1" className="text-lavender">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            name="addressLine1"
                            value={address.addressLine1}
                            onChange={handleAddressChange}
                            required
                            className="bg-midnight-blue border-gold/30 text-lavender"
                            placeholder="House no., Building name"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="addressLine2" className="text-lavender">Address Line 2 (Optional)</Label>
                          <Input
                            id="addressLine2"
                            name="addressLine2"
                            value={address.addressLine2}
                            onChange={handleAddressChange}
                            className="bg-midnight-blue border-gold/30 text-lavender"
                            placeholder="Street, Locality"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-lavender">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            required
                            className="bg-midnight-blue border-gold/30 text-lavender"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-lavender">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            required
                            className="bg-midnight-blue border-gold/30 text-lavender"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pincode" className="text-lavender">PIN Code</Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={address.pincode}
                            onChange={handleAddressChange}
                            required
                            className="bg-midnight-blue border-gold/30 text-lavender"
                            placeholder="6-digit PIN code"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-8 bg-midnight-blue-light/80 border border-gold/30">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-serif font-semibold mb-6 text-gold">Payment Method</h3>
                      
                      <RadioGroup 
                        value={paymentMethod} 
                        onValueChange={setPaymentMethod}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="online" 
                            id="online" 
                            className="border-gold text-celestial-blue"
                          />
                          <Label htmlFor="online" className="text-lavender cursor-pointer">
                            Online Payment (Credit/Debit Card, UPI, Net Banking)
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="cod" 
                            id="cod" 
                            className="border-gold text-celestial-blue"
                          />
                          <Label htmlFor="cod" className="text-lavender cursor-pointer">
                            Cash on Delivery (COD)
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </form>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="bg-midnight-blue-light/80 border border-gold/30 sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-serif font-semibold mb-6 text-gold text-center">Order Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="border-t border-gold/30 pt-4 flex justify-between">
                        <span className="text-lavender">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                        <span className="text-gold">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-lavender">Shipping</span>
                        <span className="text-gold">Free</span>
                      </div>
                      <div className="border-t border-gold/30 pt-4 flex justify-between">
                        <span className="text-xl text-lavender font-bold">Total</span>
                        <span className="text-xl text-gold font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-black text-white hover:bg-gray-800 py-6"
                      disabled={items.length === 0 || isUpdatingCart || isSubmitting}
                    >
                      {isSubmitting
                        ? (paymentMethod === 'online' ? 'Processing…' : 'Placing…')
                        : (paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
        </MysticBackground>
      </div>
    </div>
  );
}