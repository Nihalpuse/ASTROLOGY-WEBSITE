"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepCategorySelection from "./components/StepCategorySelection";
import StepProductDetails from "./components/StepProductDetails";
import StepAttributeMedia from "./components/StepAttribute&Media";
import StepShippingDetails from "./components/StepShippingDetails";
import StepDetailedSEO from "./components/StepDetailedSEO";
import StepStockManagement from "./components/StepStockManagement";
type SEOData = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  canonical_url: string;
};

const initialSEO: SEOData = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_title: '',
  og_description: '',
  og_image: '',
  twitter_title: '',
  twitter_description: '',
  twitter_image: '',
  canonical_url: '',
};

type StockData = {
  quantity: number;
  reserved: number;
  min_stock: number;
  max_stock: number;
  location: string;
  batch_number: string;
  expiry_date: string;
  cost_price: number;
};

const initialStock: StockData = {
  quantity: 0,
  reserved: 0,
  min_stock: 0,
  max_stock: 0,
  location: '',
  batch_number: '',
  expiry_date: '',
  cost_price: 0,
};
type ShippingData = {
  weight: string;
  weight_unit: string;
  length: string;
  width: string;
  height: string;
  dimension_unit: string;
  shipping_class: string;
  is_free_shipping: boolean;
  shipping_cost: string;
  handling_time: string;
  max_shipping_cost: string;
};

const initialShipping: ShippingData = {
  weight: '',
  weight_unit: 'kg',
  length: '',
  width: '',
  height: '',
  dimension_unit: 'cm',
  shipping_class: '',
  is_free_shipping: false,
  shipping_cost: '',
  handling_time: '',
  max_shipping_cost: '',
};

type ProductFormData = {
  zodiacSign: string | null;
  categoryId: number | null;
  name: string;
  description: string;
  sku: string;
  sellingPrice: string;
  originalPrice: string;
  discountPrice: string;
  color: string;
  images: string[];
  // Auto-pricing fields
  productType: string;
  weight?: string;
  carats?: string;
  quantity?: string;
  quality?: string;
  clarity?: string;
  mukhi?: string;
  material?: string;
  perCaratPrice?: string;
  perGramPrice?: string;
  perPiecePrice?: string;
};

type Errors = Partial<Record<keyof ProductFormData, string>>;

const initialFormData: ProductFormData = {
  zodiacSign: null,
  categoryId: null,
  name: "",
  description: "",
  sku: "",
  sellingPrice: "",
  originalPrice: "",
  discountPrice: "",
  color: '',
  images: [],
  // Auto-pricing fields
  productType: "",
  weight: "",
  carats: "",
  quantity: "",
  quality: "",
  clarity: "",
  mukhi: "",
  material: "",
  perCaratPrice: "",
  perGramPrice: "",
  perPiecePrice: "",
};

const steps = [
  "Category",
  "Product Details",
  "Attributes & Media",
  "Shipping",
  "SEO",
  "Stock"
];

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [media, setMedia] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [shipping, setShipping] = useState<ShippingData>(initialShipping);
  const [seo, setSEO] = useState<SEOData>(initialSEO);
  const [errors, setErrors] = useState<Errors>({});
  const [stock, setStock] = useState<StockData>(initialStock);
  const [createdProductId, setCreatedProductId] = useState<number | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Add state for categories and zodiac signs
  const [categories, setCategories] = useState<Array<{id: number, name: string, slug: string}>>([]);
  const [zodiacSigns, setZodiacSigns] = useState<Array<{id: number, name: string, slug: string}>>([]);
  
  // Check if we're in edit mode
  useEffect(() => {
    const editId = searchParams?.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditProductId(parseInt(editId));
      setCreatedProductId(parseInt(editId));
      // Start from step 0 (Category Selection) for editing
      setActiveStep(0);
    }
  }, [searchParams]);

  // Fetch categories and zodiac signs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, zodiacResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/zodiac-signs')
        ]);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        if (zodiacResponse.ok) {
          const zodiacData = await zodiacResponse.json();
          setZodiacSigns(zodiacData);
        }
      } catch (error) {
        console.error('Error fetching categories and zodiac signs:', error);
      }
    };

    fetchData();
  }, []);

  // Helper functions to get names by IDs
  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId) return '';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Category #${categoryId}`;
  };

  const getZodiacName = (zodiacId: string | null): string => {
    if (!zodiacId) return '';
    const zodiac = zodiacSigns.find(sign => sign.id.toString() === zodiacId);
    return zodiac ? zodiac.name : `Zodiac #${zodiacId}`;
  };
  
  const handleStockFieldChange = (field: string, value: string | number | boolean | string[] | null | undefined) => {
    setStock(prev => ({ ...prev, [field]: value }));
  };

  const handleStockUpdate = async () => {
    if (!createdProductId && !editProductId) {
      console.error('No product ID available for stock update');
      return;
    }

    try {
      setLoading(true);
      
             const stockData = {
         quantity: Number(stock.quantity) || 0,
         reserved: Number(stock.reserved) || 0,
         min_stock: Number(stock.min_stock) || 0,
         max_stock: stock.max_stock ? Number(stock.max_stock) : null,
         location: stock.location || null,
         batch_number: stock.batch_number || null,
         expiry_date: stock.expiry_date || null,
         cost_price: stock.cost_price ? Number(stock.cost_price) : null
       };

      const productId = createdProductId || editProductId;
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData)
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('Stock saved successfully:', savedData);
        
        // Show success message and redirect
        alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        router.push("/admin/products");
      } else {
        const errorData = await response.json();
        console.error('Error saving stock data:', errorData);
        alert('Error saving stock data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving stock data:', error);
      alert('Error saving stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleSEOFieldChange = (field: string, value: string) => {
    setSEO(prev => ({ ...prev, [field]: value }));
  };

  const handleSEONext = async () => {
    try {
      setLoading(true);
      
      // SEO data is already saved by the StepDetailedSEO component
      console.log('SEO step completed, proceeding to stock management...');
      setActiveStep(5);
      
    } catch (error) {
      console.error('Error in SEO step:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleShippingFieldChange = (field: string, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingNext = async () => {
    try {
      setLoading(true);
      
      // Shipping data is already saved by the StepShippingDetails component
      console.log('Shipping step completed, proceeding to SEO...');
      setActiveStep(4);
      
    } catch (error) {
      console.error('Error in shipping step:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 0 validation
  const validateStep0 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1 validation
  const validateStep1 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.name) {
      newErrors.name = "Product name is required.";
    }
    if (!formData.sellingPrice) {
      newErrors.sellingPrice = "Selling price is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleCategoryChange = (categoryId: number | null) => {
    setFormData((prev) => ({ ...prev, categoryId }));
    setErrors((prev) => ({ ...prev, categoryId: undefined }));
  };

  const handleZodiacChange = (zodiacSign: string | null) => {
    setFormData((prev) => ({ ...prev, zodiacSign }));
  };

  const handleNext = () => {
    if (validateStep0()) {
      setActiveStep(1);
      setErrors({});
    }
  };

  const handleFieldChange = (field: keyof ProductFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBack = () => {
    setActiveStep(0);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    
    try {
      setLoading(true);
      
      // Save product details immediately
      const productData = {
        name: formData.name,
        description: formData.description,
        sellingPrice: formData.sellingPrice,
        originalPrice: formData.originalPrice,
        discountPrice: formData.discountPrice,
        sku: formData.sku,
        categoryId: formData.categoryId,
        zodiacSign: formData.zodiacSign,
        images: formData.images,
        // Auto-pricing fields
        productType: formData.productType,
        weight: formData.weight,
        carats: formData.carats,
        quantity: formData.quantity,
        quality: formData.quality,
        clarity: formData.clarity,
        color: formData.color,
        mukhi: formData.mukhi,
        material: formData.material,
        perCaratPrice: formData.perCaratPrice,
        perGramPrice: formData.perGramPrice,
        perPiecePrice: formData.perPiecePrice
      };

      let response;
      if (isEditMode && editProductId) {
        // Update existing product
        const updateData = {
          name: formData.name,
          description: formData.description,
          price: formData.sellingPrice,
          original_price: formData.originalPrice,
          discount_price: formData.discountPrice,
          sku: formData.sku,
          category_id: formData.categoryId,
          zodiac_id: formData.zodiacSign ? parseInt(formData.zodiacSign) : null,
          images: formData.images,
          // Auto-pricing fields
          product_type: formData.productType,
          weight: formData.weight,
          carats: formData.carats,
          quantity: formData.quantity,
          quality: formData.quality,
          clarity: formData.clarity,
          color: formData.color,
          mukhi: formData.mukhi,
          material: formData.material,
          per_carat_price: formData.perCaratPrice,
          per_gram_price: formData.perGramPrice,
          per_piece_price: formData.perPiecePrice
        };
        response = await fetch(`/api/products/${editProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new product
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Product saved successfully:', result);
        if (!isEditMode) {
          setCreatedProductId(result.product.id);
        }
        setActiveStep(2);
      } else {
        const errorData = await response.json();
        console.error('Error saving product:', errorData);
        // Show error to user
        alert('Error saving product. Please try again.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (attributeId: number, value: string | number | boolean | string[] | null | undefined) => {
    // Map attribute IDs to form fields
    if (attributeId === 1) { // Assuming 1 is color attribute ID
      setFormData(prev => ({ ...prev, color: value?.toString() || '' }));
    }
  };

  const handleMediaChange = (files: File[]) => {
    setMedia(files);
  };

  const handleAttributeMediaSubmit = async () => {
    try {
      setLoading(true);
      
      // Product is already saved, just proceed to next step
      console.log('Attributes and media step completed, proceeding to shipping...');
      setActiveStep(3);
      
    } catch (error) {
      console.error('Error in attributes step:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get category and zodiac labels for Step 1
  const categoryLabel = getCategoryName(formData.categoryId);
  const zodiacLabel = getZodiacName(formData.zodiacSign);



  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-4 sm:mt-6 lg:mt-8 mx-auto max-w-7xl">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100 text-center sm:text-left">
        {isEditMode ? 'Edit Product' : 'Add Product'}
      </h1>

      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile Progress Indicator */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {activeStep + 1} of {steps.length}
            </div>
            <div className="text-sm font-medium text-purple-600">
              {steps[activeStep]}
            </div>
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
            <div
              className="absolute top-0 left-0 h-2 bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isEditMode ? 'Editing existing product - All data will be pre-filled' : `${activeStep + 1}/${steps.length} completed`}
          </div>
        </div>

        {/* Tablet/Desktop Progress Steps */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-4">
            {steps.map((label, idx) => (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-200 relative z-10
                    ${activeStep === idx
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : activeStep > idx
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300'}
                  `}
                >
                  {idx + 1}
                </div>
                <span className={`mt-2 text-xs font-medium text-center max-w-[80px] leading-tight ${activeStep === idx ? 'text-purple-600' : 'text-gray-500 dark:text-gray-300'}`}>
                  {label}
                </span>
                {/* Connection line */}
                {idx < steps.length - 1 && (
                  <div 
                    className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors duration-200 ${
                      activeStep > idx ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ 
                      transform: 'translateX(50%)',
                      width: 'calc(100% - 16px)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          {isEditMode && (
            <div className="text-sm text-purple-600 text-center">
              Editing existing product - All data will be pre-filled
            </div>
          )}
        </div>
      </div>
      {/* End Progress Bar */}
      <div className="w-full">
        {activeStep === 0 && (
          <div className="w-full">
            <StepCategorySelection
              zodiacSign={formData.zodiacSign}
              categoryId={formData.categoryId}
              onZodiacChange={handleZodiacChange}
              onCategoryChange={handleCategoryChange}
              onNext={handleNext}
              errors={errors}
              productId={createdProductId || editProductId || undefined}
            />
          </div>
        )}
        {activeStep === 1 && (
          <div className="w-full">
            <StepProductDetails
              categoryId={formData.categoryId}
              zodiacSign={zodiacLabel}
              formData={formData}
              onFieldChange={handleFieldChange as (field: string, value: string | number | boolean | string[] | null | undefined) => void}
              onBack={handleBack}
              onSubmit={handleSubmit}
              categoryLabel={categoryLabel}
              errors={errors}
              productId={createdProductId || editProductId || undefined}
            />
          </div>
        )}
        {activeStep === 2 && (
          <div className="w-full">
            <StepAttributeMedia
              categoryId={formData.categoryId}
              zodiacId={formData.zodiacSign ? parseInt(formData.zodiacSign) : null}
              selectedAttributes={{ color: formData.color || '' }}
              onAttributeChange={handleAttributeChange}
              onBack={() => setActiveStep(1)}
              onSubmit={handleAttributeMediaSubmit}
              errors={errors}
              productId={createdProductId || editProductId || undefined}
              isSubmitting={loading}
            />
          </div>
        )}
        {activeStep === 3 && (
          <div className="w-full">
            <StepShippingDetails
              productId={createdProductId || editProductId || undefined}
              shipping={shipping}
              onFieldChange={handleShippingFieldChange as (field: string, value: string | number | boolean | string[] | null | undefined) => void}
              onBack={() => setActiveStep(2)}
              onNext={() => setActiveStep(4)}
              errors={{}}
              isSubmitting={loading}
            />
          </div>
        )}
        {activeStep === 4 && (
          <div className="w-full">
            <StepDetailedSEO
              productId={createdProductId || editProductId || undefined}
              productName={formData.name}
              productDescription={formData.description}
              productImage={formData.images[0] || ''}
              seo={seo}
              onFieldChange={handleSEOFieldChange}
              onBack={() => setActiveStep(3)}
              onNext={handleSEONext}
              errors={{}}
              isSubmitting={loading}
            />
          </div>
        )}
        {activeStep === 5 && (
          <div className="w-full">
            <StepStockManagement
              productId={createdProductId || editProductId || undefined}
              stock={stock}
              onFieldChange={handleStockFieldChange}
              onBack={() => setActiveStep(4)}
              onNext={handleStockUpdate}
              errors={{}}
              isSubmitting={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
