"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

interface CarouselImage {
  id: number
  image_url: string
  alt_text?: string
  title?: string
  sort_order: number
  is_uploaded: boolean
}

interface CarouselSection {
  id: number
  name: string
  title: string
  carousel_images: CarouselImage[]
}


export default function AdminCarousalPage() {
  const [carousals, setCarousals] = useState<Record<string, string[]>>({})
  const [carouselSections, setCarouselSections] = useState<CarouselSection[]>([])
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // Fetch carousel data from API
  const fetchCarousals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/carousal')
      const result = await response.json()
      
      if (result.success) {
        setCarousals(result.data)
        
        // Also fetch sections for detailed management
        const sectionsResponse = await fetch('/api/carousal/sections')
        const sectionsResult = await sectionsResponse.json()
        if (sectionsResult.success) {
          setCarouselSections(sectionsResult.data)
        }
      } else {
        setMessage('Failed to load carousel data')
      }
    } catch (error) {
      console.error('Error fetching carousals:', error)
      setMessage('Failed to load carousel data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarousals()
  }, [])

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [message])

  // Save function is now handled by API calls
  const save = () => {
    setMessage('Images are automatically saved via API')
  }

  const addImage = async (section: string) => {
    const url = (inputs[section] || '').trim()
    if (!url) return setMessage('Enter an image URL first')
    
    try {
      setUploading(prev => ({ ...prev, [section]: true }))
      
      const formData = new FormData()
      formData.append('section', section)
      formData.append('imageUrl', url)
      
      const response = await fetch('/api/carousal', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage(`Image added to ${section}`)
        setInputs(prev => ({ ...prev, [section]: '' }))
        // Refresh data
        await fetchCarousals()
      } else {
        setMessage(result.error || 'Failed to add image')
      }
    } catch (error) {
      console.error('Error adding image:', error)
      setMessage('Failed to add image')
    } finally {
      setUploading(prev => ({ ...prev, [section]: false }))
    }
  }

  const handleFileUpload = async (section: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file')
      return
    }
    
    try {
      setUploading(prev => ({ ...prev, [section]: true }))
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', section)
      
      const response = await fetch('/api/carousal', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage(`Image uploaded to ${section}`)
        // Refresh data
        await fetchCarousals()
      } else {
        setMessage(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setMessage('Failed to upload image')
    } finally {
      setUploading(prev => ({ ...prev, [section]: false }))
    }
  }

  const removeImage = async (section: string, idx: number) => {
    // Find the section and get the image ID
    const sectionData = carouselSections.find(s => s.name === section)
    if (!sectionData || !sectionData.carousel_images[idx]) {
      setMessage('Image not found')
      return
    }
    
    const imageId = sectionData.carousel_images[idx].id
    
    try {
      const response = await fetch(`/api/carousal?id=${imageId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('Image deleted successfully')
        // Refresh data
        await fetchCarousals()
      } else {
        setMessage(result.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      setMessage('Failed to delete image')
    }
  }

  const renderEditor = (key: string, title: string) => (
    <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 text-base sm:text-lg">{title}</h3>
      <div className="space-y-2 sm:space-y-3">
        {(carousals[key] || []).map((url, i) => (
          <div key={i} className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0 relative">
              <Image 
                src={url} 
                alt={`img-${i}`} 
                fill 
                className="object-cover" 
                sizes="80px"
                unoptimized={url.startsWith('data:')}
              />
            </div>
            <div className="flex-1 text-xs sm:text-sm truncate text-gray-700 dark:text-gray-300 min-w-0">
              {url.startsWith('data:') ? `Uploaded image ${i + 1}` : url}
            </div>
            <button 
              onClick={() => removeImage(key, i)} 
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            value={inputs[key] || ''} 
            onChange={(e) => setInputs(prev => ({ ...prev, [key]: e.target.value }))} 
            placeholder="Enter image URL" 
            className="flex-1 px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          />
          <button 
            onClick={() => addImage(key)} 
            disabled={uploading[key]}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
          >
            {uploading[key] ? 'Adding...' : 'Add URL'}
          </button>
        </div>
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = e.target.files
              if (files && files.length > 0) {
                // Upload all files sequentially
                for (let i = 0; i < files.length; i++) {
                  await handleFileUpload(key, files[i])
                }
                e.target.value = '' // Reset file input
              }
            }}
            className="w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white file:hover:bg-purple-700 file:cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )

  const sections: { key: string; title: string }[] = [
    { key: 'leftTall', title: 'Left Tall' },
    { key: 'centerTop', title: 'Center Top' },
    { key: 'bottomLeft', title: 'Bottom Left' },
    { key: 'bottomRight', title: 'Bottom Right' },
    { key: 'rightTall', title: 'Right Tall' },
  ]

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Hero Carousel</h1>
          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => { setCarousals(defaultCarousals); setMessage('Restored defaults (not saved)') }}
              className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white border border-transparent transition-colors text-sm md:text-base"
            >
              Restore Defaults
            </button> */}
            <button 
              onClick={save} 
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white transition-colors text-sm md:text-base"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
           </div>
        </div>

        {message && <div className="mb-4 text-sm text-green-700 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">{message}</div>}

        {/* Editors Section */}
        <div className="space-y-6">
          {sections.map(s => renderEditor(s.key, s.title))}
        </div>
      </div>
    </div>
  )
}
