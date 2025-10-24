import React from 'react';
import { Loader2, CheckCircle, XCircle, FileText, Users, AlertCircle } from 'lucide-react';

interface ImportProgressModalProps {
  progress: {
    stage: 'uploading' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
    currentRow: number;
    totalRows: number;
    inserted: number;
    updated: number;
    duplicates: number;
    errors: number;
    currentBatch?: number;
    totalBatches?: number;
    message?: string;
    errorMessage?: string;
  };
  onClose?: () => void;
}

const ImportProgressModal: React.FC<ImportProgressModalProps> = ({ progress, onClose }) => {
  const percentage = progress.totalRows > 0
    ? Math.round((progress.currentRow / progress.totalRows) * 100)
    : 0;

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'uploading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'parsing':
        return <FileText className="w-6 h-6 text-purple-500 animate-pulse" />;
      case 'validating':
        return <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />;
      case 'importing':
        return <Users className="w-6 h-6 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStageLabel = () => {
    switch (progress.stage) {
      case 'uploading': return 'Uploading File';
      case 'parsing': return 'Reading File';
      case 'validating': return 'Validating Data';
      case 'importing': return 'Importing Records';
      case 'completed': return 'Import Completed';
      case 'error': return 'Import Failed';
    }
  };

  const isActive = !['completed', 'error'].includes(progress.stage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${progress.stage === 'error' ? 'bg-red-50 border-b border-red-200' :
            progress.stage === 'completed' ? 'bg-green-50 border-b border-green-200' :
              'bg-gradient-to-r from-[#006837] to-[#8cc63f] text-white'
          }`}>
          <div className="flex items-center gap-3">
            {getStageIcon()}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${isActive ? 'text-white' : progress.stage === 'error' ? 'text-red-900' : 'text-green-900'
                }`}>
                {getStageLabel()}
              </h3>
              {progress.message && (
                <p className={`text-sm ${isActive ? 'text-white/90' : progress.stage === 'error' ? 'text-red-700' : 'text-green-700'
                  }`}>
                  {progress.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Progress Bar */}
          {isActive && progress.totalRows > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing records...</span>
                <span className="font-medium">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#006837] to-[#8cc63f] h-full transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${percentage}%` }}
                >
                  <div className="h-full w-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{progress.currentRow.toLocaleString()} of {progress.totalRows.toLocaleString()} rows</span>
                {progress.currentBatch && progress.totalBatches && (
                  <span>Batch {progress.currentBatch} of {progress.totalBatches}</span>
                )}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {progress.inserted.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 mt-1">New Records</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {progress.updated.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">Updated</div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">
                {progress.duplicates.toLocaleString()}
              </div>
              <div className="text-xs text-yellow-600 mt-1">Duplicates</div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {progress.errors.toLocaleString()}
              </div>
              <div className="text-xs text-red-600 mt-1">Errors</div>
            </div>
          </div>

          {/* Error Message */}
          {progress.stage === 'error' && progress.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {progress.errorMessage}
              </p>
            </div>
          )}

          {/* Success Summary */}
          {progress.stage === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Import completed successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {progress.inserted} new records added, {progress.updated} records updated.
                    {progress.duplicates > 0 && ` ${progress.duplicates} duplicates were skipped.`}
                    {progress.errors > 0 && ` ${progress.errors} errors encountered.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Indicator */}
          {isActive && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Please wait, do not close this window...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isActive && onClose && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#006837] text-white rounded-lg hover:bg-[#00552e] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportProgressModal;
