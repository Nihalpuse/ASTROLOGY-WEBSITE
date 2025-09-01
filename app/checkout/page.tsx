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

interface CheckoutItem {
  id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  is_stone: boolean;
  carats?: number;
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
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CheckoutItem[]>([])
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
  
  useEffect(() => {
    // Redirect if not authenticated
    // if (status === 'unauthenticated') {
    //   router.push('/signin?redirect=checkout');
    //   return;
    // }
    
    const fetchCheckoutData = async () => {
      try {
        // Fetch cart items
        const cartRes = await fetch("/api/cart");
        if (!cartRes.ok) throw new Error('Failed to fetch cart');
        const cartData = await cartRes.json();
        
        // Convert is_stone from number to boolean to match our interface
        const formattedItems = cartData.cartItems?.map((item: { id: number; product_name: string; unit_price: number; quantity: number; is_stone: number; carats?: number }) => ({
          ...item,
          is_stone: item.is_stone === 1
        })) || [];
        
        setItems(formattedItems);
        
        // Fetch saved addresses if available
        try {
          const addressRes = await fetch("/api/user/addresses");
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
    
    if (status === 'authenticated') {
      fetchCheckoutData();
    }
  }, [status, router]);
  
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

  const handleRemoveItem = async (itemId: number) => {
    setIsUpdatingCart(true);
    try {
      const res = await fetch(`/api/cart?id=${itemId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to remove item');
      
      // Update local state
      setItems(items.filter(item => item.id !== itemId));
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item from cart");
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number, isStone: boolean) => {
    if (newQuantity < 1) return;
    
    setIsUpdatingCart(true);
    try {
      const payload = isStone 
        ? { cartItemId: itemId, carats: newQuantity }
        : { cartItemId: itemId, quantity: newQuantity };
        
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to update quantity');
      
      // Update local state
      setItems(items.map(item => {
        if (item.id === itemId) {
          if (isStone) {
            return { ...item, carats: newQuantity };
          } else {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      }));
      
      toast.success("Cart updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update cart");
    } finally {
      setIsUpdatingCart(false);
    }
  };
  
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
      // Save the address first if API endpoint exists
      await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      
      // Process payment based on method
      if (paymentMethod === 'online') {
        const res = await fetch("/api/checkout/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            shippingAddress: address
          }),
        });
        
        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url; // Redirect to payment gateway
        } else if (data.redirectUrl) {
          router.push(data.redirectUrl); // Handle dummy checkout redirect
        } else {
          throw new Error("Payment initialization failed");
        }
      } else {
        // COD processing
        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            shippingAddress: address
          }),
        });
        
        const data = await res.json();
        
        if (data.success) {
          router.push(`/order-confirmation/${data.orderId}`);
        } else {
          throw new Error("Order placement failed");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete checkout. Please try again.");
    }
  };
  
  const calculateTotalPrice = (item: CheckoutItem) => {
    if (item.is_stone && item.carats) {
      return item.unit_price * item.carats;
    }
    return item.unit_price * item.quantity;
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
                            <TableHead className="text-lavender text-center">Quantity/Carats</TableHead>
                            <TableHead className="text-lavender text-right">Total</TableHead>
                            <TableHead className="text-lavender text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-lavender font-medium">
                                {item.product_name}
                              </TableCell>
                              <TableCell className="text-lavender text-right">
                                ₹{item.unit_price.toLocaleString('en-IN')}
                                {item.is_stone && <span className="text-sm">/carat</span>}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-midnight-blue border-gold/30 text-lavender"
                                    onClick={() => handleUpdateQuantity(
                                      item.id, 
                                      item.is_stone ? (item.carats || 0) - 0.5 : item.quantity - 1, 
                                      item.is_stone
                                    )}
                                    disabled={
                                      isUpdatingCart || 
                                      (item.is_stone ? (item.carats || 0) <= 0.5 : item.quantity <= 1)
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  
                                  <span className="text-lavender min-w-16 text-center">
                                    {item.is_stone ? (
                                      <span>{item.carats} carats</span>
                                    ) : (
                                      <span>{item.quantity}</span>
                                    )}
                                  </span>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-midnight-blue border-gold/30 text-lavender"
                                    onClick={() => handleUpdateQuantity(
                                      item.id, 
                                      item.is_stone ? (item.carats || 0) + 0.5 : item.quantity + 1, 
                                      item.is_stone
                                    )}
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
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={isUpdatingCart}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
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
                      disabled={items.length === 0 || isUpdatingCart}
                    >
                      {paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
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