'use client';
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { generateSlug } from '@/utils/slugGenerator';

interface ZodiacSign {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}



export default function ZodiacSignPage() {
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addImage, setAddImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch zodiac signs on component mount
  useEffect(() => {
    fetchZodiacSigns();
  }, []);

  const fetchZodiacSigns = async () => {
    try {
      const response = await fetch('/api/zodiac-signs');
      if (response.ok) {
        const data = await response.json();
        setZodiacSigns(data);
      } else {
        console.error('Failed to fetch zodiac signs');
      }
    } catch (error) {
      console.error('Error fetching zodiac signs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditName(zodiacSigns[idx].name);
    setEditSlug(zodiacSigns[idx].slug);
    setEditImage(zodiacSigns[idx].image_url);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'edit' | 'add') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (type === 'edit') setEditImage(ev.target?.result as string);
        else setAddImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAddZodiac = async () => {
    if (!addName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const slug = addSlug.trim() || generateSlug(addName);
      const response = await fetch('/api/zodiac-signs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addName.trim(),
          slug,
          image_data: addImage
        }),
      });

      if (response.ok) {
        await fetchZodiacSigns();
        setShowAddModal(false);
        setAddName('');
        setAddSlug('');
        setAddImage(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add zodiac sign');
      }
    } catch (error) {
      console.error('Error adding zodiac sign:', error);
      alert('Failed to add zodiac sign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateZodiac = async () => {
    if (!editName.trim() || !editSlug.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/zodiac-signs/${zodiacSigns[editIdx!].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim(),
          image_data: editImage
        }),
      });

      if (response.ok) {
        await fetchZodiacSigns();
        setEditIdx(null);
        setEditName('');
        setEditSlug('');
        setEditImage(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update zodiac sign');
      }
    } catch (error) {
      console.error('Error updating zodiac sign:', error);
      alert('Failed to update zodiac sign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZodiac = async () => {
    if (deleteIdx === null) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/zodiac-signs/${zodiacSigns[deleteIdx].id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchZodiacSigns();
        setDeleteIdx(null);
      } else {
        alert('Failed to delete zodiac sign');
      }
    } catch (error) {
      console.error('Error deleting zodiac sign:', error);
      alert('Failed to delete zodiac sign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Zodiac Signs</h1>
        <button
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg shadow transition-colors flex items-center justify-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="text-sm sm:text-base">Add Zodiac Sign</span>
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading zodiac signs...</span>
        </div>
      ) : zodiacSigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No zodiac signs found. Add your first one!</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4">
            {zodiacSigns.map((sign, idx) => (
              <div key={sign.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={sign.image_url || "/placeholder-user.jpg"}
                      alt={sign.name + ' image'}
                      className="w-10 h-10 object-cover rounded-full"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{sign.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">{sign.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Edit"
                      onClick={() => handleEdit(idx)}
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Delete"
                      onClick={() => setDeleteIdx(idx)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet and Desktop Table Layout */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 md:px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-sm md:text-base">IMAGE</th>
                  <th className="px-4 md:px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-sm md:text-base">NAME</th>
                  <th className="px-4 md:px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-sm md:text-base">SLUG</th>
                  <th className="px-4 md:px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-sm md:text-base">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {zodiacSigns.map((sign, idx) => (
                  <tr key={sign.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors">
                    <td className="align-middle px-4 md:px-6 py-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        <img
                          src={sign.image_url || "/placeholder-user.jpg"}
                          alt={sign.name + ' image'}
                          className="w-6 h-6 md:w-8 md:h-8 object-cover rounded-full"
                          style={{ display: 'block' }}
                        />
                      </div>
                    </td>
                    <td className="align-middle px-4 md:px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">{sign.name}</span>
                    </td>
                    <td className="align-middle px-4 md:px-6 py-4">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-mono">{sign.slug}</span>
                    </td>
                    <td className="align-middle px-4 md:px-6 py-4">
                      <div className="flex gap-2 md:gap-3">
                        <button
                          className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit"
                          onClick={() => handleEdit(idx)}
                        >
                          <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete"
                          onClick={() => setDeleteIdx(idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {deleteIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to delete?</h2>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 mt-6">
              <button
                className="w-full sm:w-auto px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1"
                onClick={() => setDeleteIdx(null)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 order-1 sm:order-2"
                onClick={handleDeleteZodiac}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Zodiac Sign</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={editImage || "/placeholder-user.jpg"}
                  alt="Edit zodiac image"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full"
                  style={{ display: 'block' }}
                />
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">
                <span className="underline text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Edit Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageChange(e, 'edit')}
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zodiac Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={editSlug}
                onChange={e => setEditSlug(e.target.value)}
                placeholder="e.g., aries, taurus"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
              <button
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setEditIdx(null)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 order-1 sm:order-2 transition-colors"
                onClick={handleUpdateZodiac}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Add Zodiac Sign</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={addImage || "/placeholder-user.jpg"}
                  alt="Add zodiac image"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full"
                  style={{ display: 'block' }}
                />
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">
                <span className="underline text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageChange(e, 'add')}
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zodiac Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder="e.g., Aries, Taurus"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug (optional - auto-generated)</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={addSlug}
                onChange={e => setAddSlug(e.target.value)}
                placeholder="e.g., aries, taurus"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
              <button
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 order-1 sm:order-2 transition-colors"
                onClick={handleAddZodiac}
                disabled={isSubmitting || !addName.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Zodiac'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
