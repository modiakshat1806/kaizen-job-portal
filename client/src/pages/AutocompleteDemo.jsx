import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import InstitutionAutocomplete from '../components/InstitutionAutocomplete';
import { getPopularColleges, getHyderabadColleges } from '../data/indianColleges';
import collegeService from '../services/collegeService';

const AutocompleteDemo = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [stats, setStats] = useState(null);

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    alert(`Selected Institution: ${data.institution}`);
  };

  const popularColleges = getPopularColleges();
  const hyderabadColleges = getHyderabadColleges();

  // Load database stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const dbStats = await collegeService.getStats();
        setStats(dbStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, [selectedInstitution]); // Reload stats when institution changes

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Institution Autocomplete Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Test the autocomplete functionality for Indian colleges and universities
          </p>

          {/* Features List */}
          <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
              Features Demonstrated:
            </h2>
            <ul className="space-y-2 text-purple-800 dark:text-purple-200">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Real-time search with fuzzy matching
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Keyboard navigation (↑ ↓ ⏎ Esc)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Mouse click selection
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Free-text entry for unlisted colleges
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Popular suggestions when empty
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Highlighted search matches
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Dark mode support
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                🆕 Smart learning - automatically saves new colleges you type
              </li>
            </ul>
          </div>

          {/* Demo Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Student Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email'
                    }
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Institution *</label>
              <InstitutionAutocomplete
                value={watch('institution') || ''}
                onChange={(value) => {
                  setValue('institution', value);
                  setSelectedInstitution(value);
                }}
                placeholder="Type to search colleges (e.g., BITS Hyderabad, IIT, NIT)"
                error={errors.institution?.message}
                required={true}
                studentPhone={watch('phone')}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Try typing: "BITS", "IIIT", "Osmania", "CBIT", "IIT", "NIT", "VIT", etc.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                💡 Just type your college name - if it's new, it will be automatically saved for everyone!
              </p>
            </div>

            {/* Current Selection Display */}
            {selectedInstitution && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Selected Institution:
                </h3>
                <p className="text-green-700 dark:text-green-300">{selectedInstitution}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary"
              >
                Submit Form
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setValue('institution', '');
                  setSelectedInstitution('');
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Institution
              </button>
            </div>
          </form>

          {/* Hyderabad Colleges for the Fest */}
          <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
              🎉 Hyderabad & Telangana Colleges (For the Fest):
            </h3>
            <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {hyderabadColleges.slice(0, 20).map((college, index) => (
                <div
                  key={index}
                  className="text-sm text-purple-800 dark:text-purple-200 p-2 bg-white dark:bg-purple-800/20 rounded border border-purple-200 dark:border-purple-700"
                >
                  {college}
                </div>
              ))}
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-4">
              Found {hyderabadColleges.length} colleges in Hyderabad & Telangana region. Perfect for the fest attendees!
            </p>
          </div>

          {/* Database Statistics */}
          {stats && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                📊 Live Database Statistics:
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {stats.total || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Total Colleges</div>
                </div>
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {stats.dynamic || stats.userAdded || 0}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">User Added</div>
                </div>
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    {stats.hyderabad || hyderabadColleges.length}
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">Hyderabad Region</div>
                </div>
                <div className="bg-white dark:bg-blue-800/20 p-4 rounded border">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                    {stats.popular || 'N/A'}
                  </div>
                  <div className="text-sm text-orange-800 dark:text-orange-200">Popular Colleges</div>
                </div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-4">
                Statistics update in real-time as new colleges are added by users.
              </p>
            </div>
          )}

          {/* Popular Colleges Preview */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Colleges Nationwide:
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              {popularColleges.map((college, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  {college}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              The database contains 500+ colleges and universities across India.
              You can type any college name, even if it's not in the suggestions.
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              How to Use:
            </h3>
            <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
              <p><strong>Search:</strong> Start typing your college name to see suggestions</p>
              <p><strong>Navigate:</strong> Use ↑ ↓ arrow keys to navigate suggestions</p>
              <p><strong>Select:</strong> Press Enter or click to select a suggestion</p>
              <p><strong>Clear:</strong> Click the X button to clear the field</p>
              <p><strong>Custom Entry:</strong> Type any college name - new ones are automatically saved</p>
              <p><strong>Popular Colleges:</strong> Click in empty field to see popular options</p>
              <p><strong>Smart Learning:</strong> Every new college you type becomes available for everyone</p>
              <p><strong>Hyderabad Fest:</strong> Try "IIIT Hyderabad", "Osmania", "CBIT", "NIT Warangal"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutocompleteDemo;
