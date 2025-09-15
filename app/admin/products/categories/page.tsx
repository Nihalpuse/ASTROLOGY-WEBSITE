'use client';
import React, { useState, useEffect } from "react";
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

type SubcategoryModalProps = {
  parentCategory: string;
  onClose: () => void;
  onCreate: (subName: string) => void;
  isSubmitting?: boolean;
};

const SubcategoryModal: React.FC<SubcategoryModalProps> = ({ parentCategory, onClose, onCreate, isSubmitting = false }) => {
  const [subName, setSubName] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Add New Subcategory</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Subcategory name"
            value={subName}
            onChange={e => setSubName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent Category</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            value={parentCategory}
            disabled
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
          <button
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-semibold transition-colors order-1 sm:order-2 ${
              isSubmitting || !subName.trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={() => {
              if (subName.trim()) onCreate(subName.trim());
            }}
            disabled={isSubmitting || !subName.trim()}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Subcategory'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  created_at: string;
  updated_at: string;
  subcategories: Subcategory[];
};

type Subcategory = {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  category_id: number;
  created_at: string;
  updated_at: string;
};

type CategoryTree = Category;

const defaultCategories: CategoryTree[] = [
  { id: 0, name: "Gemstones & Crystals", slug: "gemstones-crystals", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Rudraksha & Malas", slug: "rudraksha-malas", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Spiritual Bracelets", slug: "spiritual-bracelets", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Sacred Yantras", slug: "sacred-yantras", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Astrology Reports", slug: "astrology-reports", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Puja Essentials", slug: "puja-essentials", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Feng Shui Items", slug: "feng-shui-items", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
  { id: 0, name: "Meditation Tools", slug: "meditation-tools", description: null, image_url: null, banner_url: null, created_at: "", updated_at: "", subcategories: [] },
];

const SubcategoryList: React.FC<{
  subcategories: Subcategory[];
  onAddSubcategory: (categoryId: number, name: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategoryId: number) => void;
  isSubmitting?: boolean;
}> = ({ subcategories, onAddSubcategory, onEditSubcategory, onDeleteSubcategory, isSubmitting = false }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      {subcategories.map((sub) => (
        <React.Fragment key={sub.id}>
          <div className="flex items-center gap-2 pl-6 md:pl-8 py-2 border-l border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900">
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">{sub.name}</span>
            <button
              className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs ml-2"
              onClick={() => setShowModal(true)}
            >
              + Sub
            </button>
            <button 
              className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ml-2" 
              title="Edit"
              onClick={() => onEditSubcategory(sub)}
            >
              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
              title="Delete"
              onClick={() => onDeleteSubcategory(sub.id)}
            >
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          {showModal && (
            <SubcategoryModal
              parentCategory={sub.name}
              onClose={() => setShowModal(false)}
              onCreate={subName => {
                onAddSubcategory(sub.category_id, subName);
                setShowModal(false);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

const CategoryModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, image: string | null, banner: string | null) => void;
  initialName?: string;
  initialDescription?: string;
  initialImage?: string | null;
  initialBanner?: string | null;
  isEdit?: boolean;
  isSubmitting?: boolean;
}> = ({ open, onClose, onSave, initialName = '', initialDescription = '', initialImage = null, initialBanner = null, isEdit = false, isSubmitting = false }) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<string | null>(initialImage);
  const [banner, setBanner] = useState<string | null>(initialBanner);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setImage(initialImage);
      setBanner(initialBanner);
    }
  }, [open, initialName, initialDescription, initialImage, initialBanner]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBanner(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{isEdit ? 'Edit Category' : 'Add Category'}</h2>
        
        {/* Category Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name *</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>

        {/* Category Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter category description (optional)"
            />
          </div>

        {/* Category Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category Image</label>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt="Category image"
                  className="w-12 h-12 object-cover rounded-full"
                />
              ) : (
                <span className="text-xl text-gray-400">📷</span>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-sm text-purple-600 hover:text-purple-700 underline">
                {image ? 'Change Image' : 'Upload Image'}
              </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
        </div>

        {/* Category Banner */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category Banner</label>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-24 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {banner ? (
                <img
                  src={banner}
                  alt="Category banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg text-gray-400">🖼️</span>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-sm text-purple-600 hover:text-purple-700 underline">
                {banner ? 'Change Banner' : 'Upload Banner'}
              </span>
          <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 mt-6">
          <button
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-semibold transition-colors order-1 sm:order-2 ${
              isSubmitting || !name.trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={() => onSave(name.trim(), description.trim(), image, banner)}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isEdit ? 'Saving...' : 'Creating...'}
              </div>
            ) : (
              isEdit ? 'Save Changes' : 'Add Category'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryCard: React.FC<{
  category: CategoryTree;
  onAddSubcategory: (categoryId: number, name: string) => void;
  onEdit: (category: CategoryTree) => void;
  onDelete: (categoryId: number) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategoryId: number) => void;
  isSubmitting?: boolean;
}> = ({ category, onAddSubcategory, onEdit, onDelete, onEditSubcategory, onDeleteSubcategory, isSubmitting = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Category Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-8 h-8 object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm text-gray-400">📷</span>
                )}
              </div>
              {category.banner_url && (
                <div className="w-8 h-4 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={category.banner_url}
                    alt={`${category.name} banner`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{category.description}</p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {category.subcategories && category.subcategories.length > 0 && (
              <button
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              </button>
            )}
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Edit"
              onClick={() => onEdit(category)}
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Delete"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Action Row */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            onClick={() => setShowModal(true)}
          >
            + Add Subcategory
          </button>
          {category.subcategories && category.subcategories.length > 0 && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg text-sm">
              {category.subcategories.length} subcategories
            </span>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {expanded && category.subcategories && category.subcategories.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {category.subcategories.map((sub) => (
            <div key={sub.id} className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {sub.image_url ? (
                      <img
                        src={sub.image_url}
                        alt={sub.name}
                        className="w-6 h-6 object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">📷</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">{sub.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{sub.slug}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="Edit"
                    onClick={() => onEditSubcategory(sub)}
                  >
                    <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="Delete"
                    onClick={() => onDeleteSubcategory(sub.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <SubcategoryModal
          parentCategory={category.name}
          onClose={() => setShowModal(false)}
          onCreate={subName => {
            onAddSubcategory(category.id, subName);
            setShowModal(false);
          }}
          isSubmitting={isSubmitting}
        />
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Category</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this category?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
              <button
                className="w-full sm:w-auto px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold order-1 sm:order-2"
                onClick={() => { setShowDeleteModal(false); onDelete(category.id); }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryRow: React.FC<{
  category: CategoryTree;
  onAddSubcategory: (categoryId: number, name: string) => void;
  onEdit: (category: CategoryTree) => void;
  onDelete: (categoryId: number) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategoryId: number) => void;
  isSubmitting?: boolean;
}> = ({ category, onAddSubcategory, onEdit, onDelete, onEditSubcategory, onDeleteSubcategory, isSubmitting = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors align-middle h-14">
        <td className="align-middle px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Expand"
              onClick={() => setExpanded(e => !e)}
              disabled={!category.subcategories || category.subcategories.length === 0}
            >
              {category.subcategories && category.subcategories.length > 0 ? (
                expanded ? <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
              ) : <span className="w-3.5 md:w-4" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-4 h-4 md:w-6 md:h-6 object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs md:text-sm text-gray-400">📷</span>
                )}
              </div>
              {category.banner_url && (
                <div className="w-4 h-2 md:w-6 md:h-3 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={category.banner_url}
                    alt={`${category.name} banner`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">{category.name}</span>
            <button
              className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs ml-2 md:ml-3 hover:bg-purple-200 transition-colors"
              onClick={() => setShowModal(true)}
            >
              + Sub
            </button>
          </div>
        </td>
        <td className="align-middle px-4 md:px-6 py-4 text-center">
          <div className="flex gap-1 md:gap-2 justify-center items-center">
            <button className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit" onClick={() => onEdit(category)}>
              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-1.5 md:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && category.subcategories && category.subcategories.length > 0 && (
        <tr>
          <td colSpan={2} className="p-0">
            <SubcategoryList 
              subcategories={category.subcategories} 
              onAddSubcategory={onAddSubcategory}
              onEditSubcategory={onEditSubcategory}
              onDeleteSubcategory={onDeleteSubcategory}
              isSubmitting={isSubmitting}
            />
          </td>
        </tr>
      )}
      {showModal && (
        <SubcategoryModal
          parentCategory={category.name}
          onClose={() => setShowModal(false)}
          onCreate={subName => {
            onAddSubcategory(category.id, subName);
            setShowModal(false);
          }}
        />
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Category</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this category?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={() => { setShowDeleteModal(false); onDelete(category.id); }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};



// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryTree | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddSubcategory = async (categoryId: number, name: string) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage('Creating subcategory...');
      
      const slug = generateSlug(name);
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, category_id: categoryId })
      });

      if (response.ok) {
        setSubmitMessage('Refreshing categories...');
        // Refresh categories to get updated data
        const refreshResponse = await fetch('/api/categories');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCategories(data);
        }
      } else {
        console.error('Failed to create subcategory');
        setSubmitMessage('Failed to create subcategory');
        setTimeout(() => setIsSubmitting(false), 2000);
        return;
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      setSubmitMessage('Error creating subcategory');
      setTimeout(() => setIsSubmitting(false), 2000);
      return;
    } finally {
      setIsSubmitting(false);
      setSubmitMessage('');
    }
  };

  const handleAddCategory = async (name: string, description: string, image: string | null, banner: string | null) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage('Creating category...');
      
      const slug = generateSlug(name);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          slug, 
          description: description || null,
          image_data: image,
          banner_data: banner
        })
      });

      if (response.ok) {
        setSubmitMessage('Refreshing categories...');
        // Refresh categories to get updated data
        const refreshResponse = await fetch('/api/categories');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCategories(data);
        }
        setShowAddModal(false);
      } else {
        console.error('Failed to create category');
        setSubmitMessage('Failed to create category');
        setTimeout(() => setIsSubmitting(false), 2000);
        return;
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setSubmitMessage('Error creating category');
      setTimeout(() => setIsSubmitting(false), 2000);
      return;
    } finally {
      setIsSubmitting(false);
      setSubmitMessage('');
    }
  };

  const handleEditCategory = (category: CategoryTree) => {
    setEditCategory(category);
    setShowEditModal(true);
  };

  const handleSaveEditCategory = async (name: string, description: string, image: string | null, banner: string | null) => {
    if (!editCategory) return;

    try {
      setIsSubmitting(true);
      setSubmitMessage('Updating category...');
      
      const slug = generateSlug(name);
      const response = await fetch(`/api/categories/${editCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          slug, 
          description: description || null,
          image_data: image,
          banner_data: banner
        })
      });

      if (response.ok) {
        setSubmitMessage('Refreshing categories...');
        // Refresh categories to get updated data
        const refreshResponse = await fetch('/api/categories');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCategories(data);
        }
        setShowEditModal(false);
        setEditCategory(null);
      } else {
        console.error('Failed to update category');
        setSubmitMessage('Failed to update category');
        setTimeout(() => setIsSubmitting(false), 2000);
        return;
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setSubmitMessage('Error updating category');
      setTimeout(() => setIsSubmitting(false), 2000);
      return;
    } finally {
      setIsSubmitting(false);
      setSubmitMessage('');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage('Deleting category...');
      
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSubmitMessage('Refreshing categories...');
        // Refresh categories to get updated data
        const refreshResponse = await fetch('/api/categories');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCategories(data);
        }
        setShowDeleteModal(false);
        setDeleteCategoryId(null);
      } else {
        console.error('Failed to delete category');
        setSubmitMessage('Failed to delete category');
        setTimeout(() => setIsSubmitting(false), 2000);
        return;
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSubmitMessage('Error deleting category');
      setTimeout(() => setIsSubmitting(false), 2000);
      return;
    } finally {
      setIsSubmitting(false);
      setSubmitMessage('');
    }
  };

  const handleEditSubcategory = async (subcategory: Subcategory) => {
    // TODO: Implement subcategory editing
    console.log('Edit subcategory:', subcategory);
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage('Deleting subcategory...');
      
      const response = await fetch(`/api/subcategories/${subcategoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSubmitMessage('Refreshing categories...');
        // Refresh categories to get updated data
        const refreshResponse = await fetch('/api/categories');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCategories(data);
        }
      } else {
        console.error('Failed to delete subcategory');
        setSubmitMessage('Failed to delete subcategory');
        setTimeout(() => setIsSubmitting(false), 2000);
        return;
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setSubmitMessage('Error deleting subcategory');
      setTimeout(() => setIsSubmitting(false), 2000);
      return;
    } finally {
      setIsSubmitting(false);
      setSubmitMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
        <button
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg shadow transition-colors flex items-center justify-center"
          onClick={() => setShowAddModal(true)}
        >
          <span className="text-sm sm:text-base">+ Add Category</span>
        </button>
      </div>
      
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found. Create your first category!</p>
          </div>
        ) : (
          categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onAddSubcategory={handleAddSubcategory}
              onEdit={handleEditCategory}
              onDelete={(categoryId) => {
                setDeleteCategoryId(categoryId);
                setShowDeleteModal(true);
              }}
              onEditSubcategory={handleEditSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
              isSubmitting={isSubmitting}
            />
          ))
        )}
      </div>

      {/* Tablet and Desktop Table Layout */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 align-middle h-14">
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 align-middle text-sm md:text-base">NAME</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 align-middle text-center text-sm md:text-base">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading categories...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-8">
                  <p className="text-gray-500">No categories found. Create your first category!</p>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onAddSubcategory={handleAddSubcategory}
                  onEdit={handleEditCategory}
                  onDelete={(categoryId) => {
                    setDeleteCategoryId(categoryId);
                    setShowDeleteModal(true);
                  }}
                  onEditSubcategory={handleEditSubcategory}
                  onDeleteSubcategory={handleDeleteSubcategory}
                  isSubmitting={isSubmitting}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Category Modal */}
      <CategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCategory}
        isSubmitting={isSubmitting}
      />
      {/* Edit Category Modal */}
      <CategoryModal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setEditCategory(null); }}
        onSave={handleSaveEditCategory}
        initialName={editCategory?.name}
        initialDescription={editCategory?.description || ''}
        initialImage={editCategory?.image_url}
        initialBanner={editCategory?.banner_url}
        isEdit
        isSubmitting={isSubmitting}
      />
      {/* Delete Category Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Category</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this category?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
              <button
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold order-2 sm:order-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold order-1 sm:order-2 transition-colors"
                onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center">
              {/* Spinner */}
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              {/* Message */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {submitMessage}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we process your request...
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-6 overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;