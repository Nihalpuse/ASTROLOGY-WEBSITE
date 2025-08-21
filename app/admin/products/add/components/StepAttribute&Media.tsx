import React, { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, Save } from "lucide-react";

interface Attribute {
  id: number;
  name: string;
  type: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
}

interface AttributeValue {
  id: number;
  value: string;
  slug: string;
  is_active: boolean;
}

interface CategoryAttribute {
  id: number;
  category_id: number;
  attribute_id: number;
  is_required: boolean;
  sort_order: number;
  attribute: Attribute;
  attribute_values?: AttributeValue[];
}

interface ZodiacAttribute {
  id: number;
  zodiac_id: number;
  attribute_id: number;
  is_required: boolean;
  sort_order: number;
  attribute: Attribute;
  attribute_values?: AttributeValue[];
}

// Interface for existing attribute structure from API
interface ExistingAttribute {
  values: { value: string }[];
  attributeType: string;
  attributeId: number;
}

// Type for attribute values based on attribute type
type AttributeValueType = string | number | boolean | string[] | null | undefined;

interface StepAttributeMediaProps {
  categoryId: number | null;
  zodiacId: number | null;
  selectedAttributes: { [key: string]: AttributeValueType };
  onAttributeChange: (attributeId: number, value: AttributeValueType) => void;
  onBack: () => void;
  onSubmit: () => void;
  errors: { [key: string]: string };
  productId?: number | null; // Add productId prop for saving attributes
  isSubmitting?: boolean; // Add loading state
}

const StepAttributeMedia: React.FC<StepAttributeMediaProps> = ({
  categoryId,
  zodiacId,
  selectedAttributes = {},
  onAttributeChange,
  onBack,
  onSubmit,
  errors,
  productId,
  isSubmitting = false,
}) => {
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [zodiacAttributes, setZodiacAttributes] = useState<ZodiacAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [localSelectedAttributes, setLocalSelectedAttributes] = useState<{ [key: string]: AttributeValueType }>(selectedAttributes);
  const [savingAttributes, setSavingAttributes] = useState(false);

  // Fetch attributes for the selected category and zodiac
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        setError(null);

        const promises = [];

        // Fetch category attributes if category is selected
        if (categoryId) {
          promises.push(
            fetch(`/api/category-attributes?category_id=${categoryId}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
        } else {
          promises.push(Promise.resolve([]));
        }

        // Fetch zodiac attributes if zodiac is selected
        if (zodiacId) {
          promises.push(
            fetch(`/api/zodiac-attributes?zodiac_id=${zodiacId}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
        } else {
          promises.push(Promise.resolve([]));
        }

        const [categoryAttrs, zodiacAttrs] = await Promise.all(promises);

        // Fetch attribute values for each attribute
        const categoryAttrsWithValues = await Promise.all(
          categoryAttrs.map(async (attr: CategoryAttribute) => {
            try {
              const valuesResponse = await fetch(`/api/attributes/${attr.attribute_id}/values`);
              if (valuesResponse.ok) {
                const values = await valuesResponse.json();
                return { ...attr, attribute_values: values };
              }
            } catch (error) {
              console.error('Error fetching attribute values:', error);
            }
            return attr;
          })
        );

        const zodiacAttrsWithValues = await Promise.all(
          zodiacAttrs.map(async (attr: ZodiacAttribute) => {
            try {
              const valuesResponse = await fetch(`/api/attributes/${attr.attribute_id}/values`);
              if (valuesResponse.ok) {
                const values = await valuesResponse.json();
                return { ...attr, attribute_values: values };
              }
            } catch (error) {
              console.error('Error fetching attribute values:', error);
            }
            return attr;
          })
        );

        setCategoryAttributes(categoryAttrsWithValues);
        setZodiacAttributes(zodiacAttrsWithValues);

      } catch (err) {
        console.error('Error fetching attributes:', err);
        setError('Failed to load attributes');
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [categoryId, zodiacId]);

  // Load existing product attributes if editing
  useEffect(() => {
    const loadExistingAttributes = async () => {
      if (productId) {
        try {
          const response = await fetch(`/api/products/${productId}/attributes`);
          if (response.ok) {
            const existingAttributes = await response.json();
            const formattedAttributes: { [key: string]: AttributeValueType } = {};
            
            (Object.values(existingAttributes) as ExistingAttribute[]).forEach((attr) => {
              if (attr.values && attr.values.length > 0) {
                if (attr.attributeType === 'multiselect') {
                  formattedAttributes[attr.attributeId] = attr.values.map((v: { value: string }) => v.value);
                } else {
                  formattedAttributes[attr.attributeId] = attr.values[0].value;
                }
              }
            });
            
            setLocalSelectedAttributes(formattedAttributes);
          }
        } catch (error) {
          console.error('Error loading existing attributes:', error);
        }
      }
    };

    loadExistingAttributes();
  }, [productId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle local attribute changes
  const handleLocalAttributeChange = (attributeId: number, value: AttributeValueType) => {
    setLocalSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: value
    }));
    // Also call the parent's onAttributeChange for backward compatibility
    onAttributeChange(attributeId, value);
  };

  // Save attributes to database
  const saveAttributesToDatabase = async () => {
    if (!productId) {
      console.error('No product ID available for saving attributes');
      return false;
    }

    try {
      setSavingAttributes(true);
      
      // Prepare attributes data for API
      const attributesToSave: Array<{
        attributeId: number;
        value: AttributeValueType;
        valueType: string;
      }> = [];
      
      // Process category attributes
      categoryAttributes.forEach(attr => {
        const value = localSelectedAttributes[attr.attribute_id];
        if (value !== undefined && value !== null && value !== '') {
          attributesToSave.push({
            attributeId: attr.attribute_id,
            value: value,
            valueType: attr.attribute.type
          });
        }
      });

      // Process zodiac attributes
      zodiacAttributes.forEach(attr => {
        const value = localSelectedAttributes[attr.attribute_id];
        if (value !== undefined && value !== null && value !== '') {
          attributesToSave.push({
            attributeId: attr.attribute_id,
            value: value,
            valueType: attr.attribute.type
          });
        }
      });

      console.log('Saving attributes:', attributesToSave);

      const response = await fetch(`/api/products/${productId}/attributes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributes: attributesToSave }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Attributes saved successfully:', result);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error saving attributes:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error saving attributes:', error);
      return false;
    } finally {
      setSavingAttributes(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (productId) {
      // Save attributes to database first
      const attributesSaved = await saveAttributesToDatabase();
      if (!attributesSaved) {
        setError('Failed to save attributes. Please try again.');
        return;
      }
    }
    
    // Call the parent's onSubmit
    onSubmit();
  };

  const renderAttributeInput = (attribute: Attribute, attributeValues?: AttributeValue[]) => {
    const currentValue = localSelectedAttributes[attribute.id];
    const isRequired = attribute.is_required;

    switch (attribute.type) {
      case 'text':
        return (
          <input
            type="text"
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 transition-colors ${errors[`attribute_${attribute.id}`] ? 'border-red-500 dark:border-red-400' : ''}`}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={e => handleLocalAttributeChange(attribute.id, e.target.value)}
            placeholder={`Enter ${attribute.name.toLowerCase()}`}
            required={isRequired}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 transition-colors ${errors[`attribute_${attribute.id}`] ? 'border-red-500 dark:border-red-400' : ''}`}
            value={typeof currentValue === 'number' ? currentValue.toString() : ''}
            onChange={e => handleLocalAttributeChange(attribute.id, parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${attribute.name.toLowerCase()}`}
            required={isRequired}
            min="0"
            step="0.01"
          />
        );

      case 'select':
        return (
          <select
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 transition-colors ${errors[`attribute_${attribute.id}`] ? 'border-red-500 dark:border-red-400' : ''}`}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={e => handleLocalAttributeChange(attribute.id, e.target.value)}
            required={isRequired}
          >
            <option value="">Select {attribute.name.toLowerCase()}</option>
            {attributeValues?.map(value => (
              <option key={value.id} value={value.id}>
                {value.value}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {attributeValues?.map(value => (
              <label key={value.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked={Array.isArray(currentValue) && currentValue.includes(value.id.toString())}
                  onChange={e => {
                    const currentArray = Array.isArray(currentValue) ? currentValue : [];
                    const newValue = e.target.checked
                      ? [...currentArray, value.id.toString()]
                      : currentArray.filter(id => id !== value.id.toString());
                    handleLocalAttributeChange(attribute.id, newValue);
                  }}
                />
                <span className="text-gray-700 dark:text-gray-300">{value.value}</span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              checked={typeof currentValue === 'boolean' ? currentValue : false}
              onChange={e => handleLocalAttributeChange(attribute.id, e.target.checked)}
            />
            <span className="text-gray-700 dark:text-gray-300">Yes</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 transition-colors ${errors[`attribute_${attribute.id}`] ? 'border-red-500 dark:border-red-400' : ''}`}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={e => handleLocalAttributeChange(attribute.id, e.target.value)}
            required={isRequired}
          />
        );

      default:
        return (
          <input
            type="text"
            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 transition-colors ${errors[`attribute_${attribute.id}`] ? 'border-red-500 dark:border-red-400' : ''}`}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={e => handleLocalAttributeChange(attribute.id, e.target.value)}
            placeholder={`Enter ${attribute.name.toLowerCase()}`}
            required={isRequired}
          />
        );
    }
  };

  const renderAttributeSection = (attributes: (CategoryAttribute | ZodiacAttribute)[], title: string, sectionId: string) => {
    if (attributes.length === 0) return null;

    const isExpanded = expandedSections[sectionId];

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {attributes.length} attribute{attributes.length !== 1 ? 's' : ''} available
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-6 pb-6 space-y-6">
            {attributes.map((attr) => (
              <div key={attr.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {attr.attribute.name}
                  {attr.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {attr.attribute.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {attr.attribute.description}
                  </p>
                )}
                {renderAttributeInput(attr.attribute, attr.attribute_values)}
                {errors[`attribute_${attr.attribute.id}`] && (
                  <p className="text-red-600 dark:text-red-400 text-xs">{errors[`attribute_${attr.attribute.id}`]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading attributes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 w-full">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-2">Error loading attributes</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasAttributes = categoryAttributes.length > 0 || zodiacAttributes.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Product Attributes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select attributes for your product based on category and zodiac
        </p>
      </div>

      {!hasAttributes ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Attributes Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No attributes are configured for the selected category and zodiac combination.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderAttributeSection(categoryAttributes, 'Category Attributes', 'category')}
          {renderAttributeSection(zodiacAttributes, 'Zodiac Attributes', 'zodiac')}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className="px-6 py-3 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition-colors"
          onClick={onBack}
          disabled={isSubmitting || savingAttributes}
        >
          ← Back
        </button>
        <button
          type="button"
          className="px-8 py-3 text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting || savingAttributes}
        >
          {savingAttributes ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving Attributes...
            </>
          ) : isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepAttributeMedia;
