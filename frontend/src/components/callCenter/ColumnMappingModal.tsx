import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';

interface ColumnMappingProps {
  preview: {
    headers: Array<{
      index: number;
      name: string;
      sample: string[];
    }>;
    sampleData: string[][];
    totalRows: number;
  };
  onMapping: (mapping: Record<string, number>) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FieldRequirement {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

const REQUIRED_FIELDS: FieldRequirement[] = [
  {
    key: 'vin',
    label: 'VIN (Voter ID Number)',
    required: false,
    description: 'Voter Identification Number from INEC'
  },
  {
    key: 'firstName',
    label: 'First Name',
    required: false,
    description: 'Voter first name'
  },
  {
    key: 'lastName',
    label: 'Last Name / Surname',
    required: false,
    description: 'Voter surname or last name'
  },
  {
    key: 'fullName',
    label: 'Full Name',
    required: false,
    description: 'Complete voter name (if first/last not separate)'
  },
  {
    key: 'state',
    label: 'State',
    required: true,
    description: 'State name (e.g., Anambra, Adamawa)'
  },
  {
    key: 'lga',
    label: 'Local Government Area (LGA)',
    required: true,
    description: 'Local Government Area name'
  },
  {
    key: 'ward',
    label: 'Ward',
    required: true,
    description: 'Ward name'
  },
  {
    key: 'pollingUnit',
    label: 'Polling Unit',
    required: true,
    description: 'Polling unit name'
  },
  {
    key: 'pollingUnitCode',
    label: 'Polling Unit Code',
    required: false,
    description: 'Polling unit code (e.g., 02-01-01-001)'
  },
  {
    key: 'phoneNumber',
    label: 'Phone Number',
    required: true,
    description: 'Voter phone number'
  },
  {
    key: 'emailAddress',
    label: 'Email Address',
    required: false,
    description: 'Voter email address'
  },
  {
    key: 'gender',
    label: 'Gender',
    required: false,
    description: 'Voter gender'
  },
  {
    key: 'ageGroup',
    label: 'Age Group',
    required: false,
    description: 'Voter age group'
  }
];

const ColumnMappingModal: React.FC<ColumnMappingProps> = ({
  preview,
  onMapping,
  onCancel,
  loading = false
}) => {
  const [columnMapping, setColumnMapping] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleColumnSelect = (fieldKey: string, columnIndex: number) => {
    setColumnMapping(prev => {
      const newMapping = { ...prev };

      // Remove this column from any other field mapping
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === columnIndex && key !== fieldKey) {
          delete newMapping[key];
        }
      });

      // Set new mapping
      newMapping[fieldKey] = columnIndex;

      return newMapping;
    });
  };

  const validateMapping = (): string[] => {
    const validationErrors: string[] = [];

    // Check required fields
    const requiredFields = REQUIRED_FIELDS.filter(field => field.required);
    requiredFields.forEach(field => {
      if (!(field.key in columnMapping)) {
        validationErrors.push(`${field.label} is required`);
      }
    });

    // Check for duplicate column assignments
    const usedColumns = Object.values(columnMapping);
    const duplicates = usedColumns.filter((col, index, arr) => arr.indexOf(col) !== index);
    if (duplicates.length > 0) {
      validationErrors.push('Each column can only be mapped to one field');
    }

    return validationErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateMapping();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onMapping(columnMapping);
  };

  const getColumnValue = (columnIndex: number, rowIndex: number = 1) => {
    return preview.sampleData[rowIndex]?.[columnIndex] || '';
  };

  const isColumnMapped = (columnIndex: number) => {
    return Object.values(columnMapping).includes(columnIndex);
  };

  const getMappedField = (columnIndex: number) => {
    return Object.keys(columnMapping).find(key => columnMapping[key] === columnIndex);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Map Excel Columns to Fields
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {preview.totalRows} rows found. Match each column to the appropriate field.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Please fix these issues:</h4>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Excel Columns Preview */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Excel Columns ({preview.headers.length})
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {preview.headers.map((header, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg transition-colors ${isColumnMapped(index)
                        ? 'border-[#006837] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Col {index + 1}
                            </span>
                            <span className="font-medium text-gray-900">
                              {header.name || `Column ${index + 1}`}
                            </span>
                            {isColumnMapped(index) && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Sample values:</p>
                            <div className="flex flex-wrap gap-1">
                              {header.sample.slice(0, 3).map((sample, sampleIndex) => (
                                <span
                                  key={sampleIndex}
                                  className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded truncate max-w-20"
                                  title={sample}
                                >
                                  {sample}
                                </span>
                              ))}
                              {header.sample.length === 0 && (
                                <span className="text-xs text-gray-400">No sample data</span>
                              )}
                            </div>
                          </div>

                          {isColumnMapped(index) && (
                            <div className="mt-2 text-xs text-green-600">
                              ✓ Mapped to: {REQUIRED_FIELDS.find(f => f.key === getMappedField(index))?.label}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Mapping */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Required & Optional Fields
                </h4>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {REQUIRED_FIELDS.map((field) => (
                    <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{field.label}</h5>
                            {field.required && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                        </div>
                      </div>

                      <select
                        value={columnMapping[field.key] ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setColumnMapping(prev => {
                              const newMapping = { ...prev };
                              delete newMapping[field.key];
                              return newMapping;
                            });
                          } else {
                            handleColumnSelect(field.key, parseInt(value));
                          }
                        }}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006837] focus:border-[#006837] text-sm"
                      >
                        <option value="">Select column...</option>
                        {preview.headers.map((header, index) => (
                          <option
                            key={index}
                            value={index}
                            disabled={isColumnMapped(index) && columnMapping[field.key] !== index}
                          >
                            Col {index + 1}: {header.name || `Column ${index + 1}`}
                            {header.sample.length > 0 && ` (e.g., ${header.sample[0]})`}
                          </option>
                        ))}
                      </select>

                      {columnMapping[field.key] !== undefined && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Sample:</strong> {getColumnValue(columnMapping[field.key])}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {Object.keys(columnMapping).length} of {REQUIRED_FIELDS.filter(f => f.required).length} required fields mapped
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(columnMapping).length < REQUIRED_FIELDS.filter(f => f.required).length}
                className="px-4 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00592e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                )}
                <ArrowRight className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingModal;