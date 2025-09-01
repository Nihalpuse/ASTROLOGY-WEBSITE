'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/useLanguage';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-7xl mx-auto p-0 sm:p-4 md:p-8">
      
      {items.length === 0 ? (
        <div className="w-full max-w-4xl mx-auto p-0 sm:p-4">
          <Card className="rounded-2xl border border-gray-200" style={{ background: '#fefbf2' }}>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16" style={{ background: '#fefbf2' }}>
              <ShoppingBag className="h-16 w-16 text-black mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{t('cart.empty')}</h2>
              <p className="text-gray-600 mb-6">{t('cart.emptyDescription') || t('cart.description')}</p>
              <Button asChild className="rounded-lg px-6 py-2 text-base font-semibold">
                <Link href="/">{t('cart.continueShopping')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-black grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-0">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border border-gray-200 mt-0" style={{ background: '#fefbf2' }}>
              <CardContent className="p-0" style={{ background: '#fefbf2' }}>
                <div className="p-4 sm:p-6 pb-0 flex flex-col sm:flex-row items-center sm:items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold flex items-center gap-2"><ShoppingBag className="h-6 w-6 mr-1" /> {t('cart.yourCart')} <span className="font-normal text-base sm:text-lg">({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})</span></span>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex flex-col xs:flex-row items-center xs:items-start gap-4 p-4 sm:p-6">
                      <div className="relative h-20 w-20 min-w-[80px] min-h-[80px] rounded-lg overflow-hidden bg-gray-100 border mx-auto xs:mx-0">
                        {(item.image || item.image_url) ? (
                          <img src={item.image || item.image_url} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h3 className="font-bold text-base sm:text-lg md:text-xl text-black truncate">{item.name}</h3>
                            <div className="flex gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                              {/* No size/color for CartItem */}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500"
                            title={t('cart.remove')}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
                          <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <button
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 rounded bg-white text-black text-lg sm:text-xl disabled:opacity-50"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-base sm:text-lg font-medium">{item.quantity}</span>
                            <button
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 rounded bg-white text-black text-lg sm:text-xl"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right min-w-[80px] sm:min-w-[100px]">
                            <div className="font-bold text-base sm:text-lg md:text-xl text-black">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                            <div className="text-xs sm:text-sm text-gray-500">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <Card className="text-black rounded-2xl border border-gray-200" style={{ background: '#fefbf2' }}>
              <CardContent className="space-y-4 p-4 sm:p-6" style={{ background: '#fefbf2' }}>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-black">Order Summary</h3>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Shipping</span>
                  <div className="text-right">
                    <span className="line-through text-gray-400 mr-2">₹9.99</span>
                    <span className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs sm:text-sm font-medium ml-1">Free</span>
                  </div>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Tax</span>
                  <span>₹{(total * 0.08).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-300 pt-4 mb-2">
                  <div className="flex justify-between text-lg sm:text-xl font-bold">
                    <span>Total</span>
                    <span>₹{(total * 1.08).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800 text-base font-semibold py-3 rounded-lg mt-2">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-white border border-gray-300 text-base font-semibold py-3 rounded-lg">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
            {/* Promo Code */}
            <Card className="mt-4 rounded-2xl border border-gray-200" style={{ background: '#fefbf2' }}>
              <CardContent className="p-4 sm:p-6" style={{ background: '#fefbf2' }}>
                <h4 className="text-base sm:text-lg font-semibold mb-3">Promo Code</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base"
                  />
                  <Button variant="outline" className="rounded-md px-5">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}