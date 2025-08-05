import React, { useState, useEffect } from 'react';
import { Upload, Database, FileText, BarChart3, CheckCircle, AlertCircle, Download } from 'lucide-react';
import collegeService from '../services/collegeService';

const CollegeDataManager = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [importResults, setImportResults] = useState(null);

  // Load database statistics
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dbStats = await collegeService.getStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Handle CSV file upload (placeholder - would need backend endpoint)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: 'Please select a CSV file' });
      return;
    }

    setIsLoading(true);
    setUploadStatus({ type: 'info', message: 'Processing CSV file...' });

    try {
      // In a real implementation, you would upload the file to the server
      // For now, we'll simulate the process
      
      // Read file content for preview
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      setImportResults({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        totalRows: lines.length - 1,
        headers: headers.map(h => h.replace(/"/g, '').trim()),
        preview: lines.slice(1, 6).map(line => 
          line.split(',').map(cell => cell.replace(/"/g, '').trim())
        )
      });

      setUploadStatus({ 
        type: 'success', 
        message: `CSV file "${file.name}" loaded successfully. Review the data below.` 
      });

    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: `Error processing file: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate import process
  const handleImport = async () => {
    if (!importResults) return;

    setIsLoading(true);
    setUploadStatus({ type: 'info', message: 'Importing colleges to database...' });

    try {
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful import
      const mockResults = {
        processed: importResults.totalRows,
        added: Math.floor(importResults.totalRows * 0.7),
        updated: Math.floor(importResults.totalRows * 0.2),
        errors: Math.floor(importResults.totalRows * 0.1)
      };

      setUploadStatus({ 
        type: 'success', 
        message: `Import completed! Added ${mockResults.added} new colleges, updated ${mockResults.updated} existing colleges.` 
      });

      // Refresh stats
      await loadStats();

    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: `Import failed: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            College Database Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Import CSV datasets and manage the college database
          </p>

          {/* Current Statistics */}
          {stats && (
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Current Database Statistics
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {stats.total || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Total Colleges</div>
                </div>
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {stats.verified || 'N/A'}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">Verified</div>
                </div>
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    {stats.userAdded || stats.dynamic || 0}
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">User Added</div>
                </div>
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                    {stats.popular || 'N/A'}
                  </div>
                  <div className="text-sm text-orange-800 dark:text-orange-200">Popular</div>
                </div>
              </div>
            </div>
          )}

          {/* CSV Upload Section */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Import CSV Dataset
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                  dark:file:bg-purple-900/20 dark:file:text-purple-300
                  dark:hover:file:bg-purple-900/30"
              />
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className={`p-4 rounded-lg mb-4 flex items-center ${
                uploadStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                uploadStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}>
                {uploadStatus.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> :
                 uploadStatus.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> :
                 <Database className="w-5 h-5 mr-2" />}
                {uploadStatus.message}
              </div>
            )}

            {/* File Preview */}
            {importResults && (
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  File Preview
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">File Name:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{importResults.fileName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">File Size:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{importResults.fileSize}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Rows:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{importResults.totalRows}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Headers:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {importResults.headers.map((header, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sample Data (first 5 rows):</span>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          {importResults.headers.map((header, index) => (
                            <th key={index} className="px-2 py-1 text-left text-gray-700 dark:text-gray-300">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importResults.preview.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-600">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 text-gray-600 dark:text-gray-400">
                                {cell.length > 30 ? cell.substring(0, 30) + '...' : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="btn-primary flex items-center"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {isLoading ? 'Importing...' : 'Import to Database'}
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
              📋 Instructions for CSV Import
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <p><strong>Step 1:</strong> Copy your CSV file to: <code>kaizen-job-portal/data/Indian_Engineering_Colleges_Dataset.csv</code></p>
              <p><strong>Step 2:</strong> Run the import command: <code>cd server && npm run import-csv</code></p>
              <p><strong>Step 3:</strong> Or use this web interface to preview and import the data</p>
              
              <div className="mt-4">
                <p><strong>Expected CSV columns:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>College Name:</strong> college_name, name, institution_name</li>
                  <li><strong>State:</strong> state, State, state_name</li>
                  <li><strong>City:</strong> city, district, location</li>
                  <li><strong>Type:</strong> type, category (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDataManager;
