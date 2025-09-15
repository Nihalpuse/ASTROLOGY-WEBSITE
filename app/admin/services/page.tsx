// app/admin/services/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Clock, Globe, Image, Upload, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the Service interface based on the new schema
interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration?: string;
  delivery_type?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  service_media?: ServiceMedia[];
}

interface ServiceMedia {
  id: number;
  service_id: number;
  media_type: string;
  media_url: string;
  alt_text?: string;
  title?: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    duration: '',
    delivery_type: 'online',
    is_active: true,
    images: [] as string[]
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      setServices(data.services || data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch services. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const newImages: string[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(prev => ({ ...prev, [i]: 0 }));

      try {
        // Convert file to base64 for Cloudinary upload
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Upload to Cloudinary using the existing utility
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            folder: 'services'
          }),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        newImages.push(data.url);
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));

      } catch (error) {
        console.error('Image upload error:', error);
        setUploadProgress(prev => ({ ...prev, [i]: -1 })); // Error state
        toast({
          title: 'Upload Error',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    // Add new images to existing ones (limit to 5 images)
    const currentImages = formData.images || [];
    const totalImages = [...currentImages, ...newImages];
    const limitedImages = totalImages.slice(0, 5); // Limit to 5 images
    setFormData(prev => ({ ...prev, images: limitedImages }));
    setUploading(false);
    setUploadProgress({});
  };

  // Remove image
  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleDragAreaClick = () => {
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleAddNew = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      price: '',
      duration: '',
      delivery_type: 'online',
      is_active: true,
      images: []
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setFormData({
      title: service.title,
      slug: service.slug,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration || '',
      delivery_type: service.delivery_type || 'online',
      is_active: service.is_active,
      images: service.service_media?.map(media => media.media_url) || []
    });
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update service' : 'Failed to create service');
      }
      
      fetchServices();
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: editingId ? 'Service updated successfully' : 'Service created successfully',
      });
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      
      fetchServices();
      
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  // Generate slug from title
  const generateSlug = () => {
    const title = formData.title;
    if (!title) return;
    
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const deliveryTypeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'chat', label: 'Chat' },
    { value: 'video', label: 'Video Call' },
    { value: 'audio', label: 'Audio Call' }
  ];

  const durationOptions = [
    { value: '15 minutes', label: '15 minutes' },
    { value: '30 minutes', label: '30 minutes' },
    { value: '45 minutes', label: '45 minutes' },
    { value: '60 minutes', label: '1 hour' },
    { value: '90 minutes', label: '1.5 hours' },
    { value: '120 minutes', label: '2 hours' },
    { value: '180 minutes', label: '3 hours' }
  ];

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Manage Services</h1>
        <Button onClick={handleAddNew} className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Add New Service
        </Button>
      </div>
      
      <div className="bg-white dark:bg-[#0B1120] rounded-lg shadow-sm border border-gray-200 dark:border-[#1f2937]">
        <div className="px-3 sm:px-6 py-4 border-b border-gray-200 dark:border-[#1f2937] bg-gray-50 dark:bg-[#1e293b] rounded-t-lg">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">All Services</h2>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No services found
            </div>
          ) : (
            <>
              {/* Mobile/Tablet Card Layout */}
              <div className="block lg:hidden">
                <div className="space-y-4 p-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {service.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
                            {service.slug}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="border-muted-foreground/30 p-2">
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="border-muted-foreground/30 p-2">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Price:</span>
                          <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            ₹{service.price}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            service.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Duration:</span>
                          <span className="text-gray-900 dark:text-white">
                            {service.duration || 'Not specified'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Delivery:</span>
                          <span className="text-gray-900 dark:text-white capitalize">
                            {service.delivery_type || 'Not specified'}
                          </span>
                        </div>
                      </div>
                      
                      {service.description && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Description:</span>
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Delivery Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} className="hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors">
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {service.title}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {service.slug}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          ₹{service.price}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {service.duration || 'Not specified'}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{service.delivery_type || 'Not specified'}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="border-muted-foreground/30">
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="border-muted-foreground/30">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] overflow-y-auto border-0 shadow-lg p-0">
          <div className="p-4 sm:p-6">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-lg sm:text-xl font-bold">
                {editingId ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="title">
                    Service Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={generateSlug}
                    placeholder="Birth Chart Analysis"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="slug">
                    Slug *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="birth-chart-analysis"
                      className="flex-1 font-mono"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateSlug} 
                      className="w-full sm:w-auto whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="price">
                    Price (₹) *
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="2999.00"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="duration">
                    Duration
                  </label>
                  <Select value={formData.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="delivery_type">
                    Delivery Type
                  </label>
                  <Select value={formData.delivery_type} onValueChange={(value) => handleSelectChange('delivery_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 lg:col-span-1">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Active Service
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="description">
                  Description *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Comprehensive analysis of your birth chart to understand your personality, strengths, and life path..."
                  className="w-full"
                  rows={4}
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Service Images (Max 5)
                </label>
                
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
                    uploading 
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                  }`}
                  onClick={handleDragAreaClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop images here, or click to select
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <div className={`inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}>
                    {uploading ? 'Uploading...' : 'Choose Images'}
                  </div>
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([index, progress]) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              progress === -1 ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.abs(progress)}%` }}
                          />
                        </div>
                        {progress === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {progress === -1 && <X className="h-4 w-4 text-red-500" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Preview */}
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Uploaded Images:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Service image ${index + 1}`}
                            className="w-full h-20 sm:h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-300 w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-2"
                  disabled={uploading}
                >
                  {editingId ? 'Update Service' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}