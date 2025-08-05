import { collegeAPI } from './api';
import { 
  searchColleges as searchStaticColleges, 
  getPopularColleges as getStaticPopularColleges,
  getHyderabadColleges,
  addDynamicCollege,
  getAllColleges
} from '../data/indianColleges';

// Enhanced college service that combines static data with dynamic API data
class CollegeService {
  constructor() {
    this.useAPI = true; // Flag to enable/disable API usage
    this.cache = new Map(); // Simple cache for API responses
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Check if we should use API or fallback to static data
  async isAPIAvailable() {
    try {
      await collegeAPI.getStats();
      return true;
    } catch (error) {
      console.warn('College API not available, using static data:', error.message);
      return false;
    }
  }

  // Get cache key
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  // Get from cache
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Search colleges with hybrid approach
  async searchColleges(query, limit = 10) {
    const cacheKey = this.getCacheKey('search', { query, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (this.useAPI && await this.isAPIAvailable()) {
        // Try API first
        const response = await collegeAPI.search(query, limit);
        const apiResults = response.data.colleges.map(college => college.name);
        
        // Combine with static results for better coverage
        const staticResults = searchStaticColleges(query, limit);
        const combined = [...new Set([...apiResults, ...staticResults])].slice(0, limit);
        
        this.setCache(cacheKey, combined);
        return combined;
      }
    } catch (error) {
      console.warn('API search failed, using static data:', error.message);
    }

    // Fallback to static search
    const results = searchStaticColleges(query, limit);
    this.setCache(cacheKey, results);
    return results;
  }

  // Get popular colleges
  async getPopularColleges(limit = 15) {
    const cacheKey = this.getCacheKey('popular', { limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (this.useAPI && await this.isAPIAvailable()) {
        const response = await collegeAPI.getPopular(limit);
        const results = response.data.colleges.map(college => college.name);
        this.setCache(cacheKey, results);
        return results;
      }
    } catch (error) {
      console.warn('API popular colleges failed, using static data:', error.message);
    }

    // Fallback to static data
    const results = getStaticPopularColleges();
    this.setCache(cacheKey, results);
    return results;
  }

  // Get colleges by region
  async getCollegesByRegion(region, limit = 20) {
    const cacheKey = this.getCacheKey('region', { region, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (this.useAPI && await this.isAPIAvailable()) {
        const response = await collegeAPI.getByRegion(region, limit);
        const results = response.data.colleges.map(college => college.name);
        this.setCache(cacheKey, results);
        return results;
      }
    } catch (error) {
      console.warn('API region search failed, using static data:', error.message);
    }

    // Fallback to static data
    if (region.toLowerCase().includes('hyderabad') || 
        region.toLowerCase().includes('telangana')) {
      const results = getHyderabadColleges().slice(0, limit);
      this.setCache(cacheKey, results);
      return results;
    }

    // For other regions, use search
    const results = searchStaticColleges(region, limit);
    this.setCache(cacheKey, results);
    return results;
  }

  // Add new college (with API persistence)
  async addCollege(collegeName, addedBy = null) {
    const trimmedName = collegeName.trim();
    
    if (trimmedName.length < 3) {
      throw new Error('College name must be at least 3 characters');
    }

    try {
      if (this.useAPI && await this.isAPIAvailable()) {
        // Add to API database
        const response = await collegeAPI.add({
          name: trimmedName,
          addedBy
        });
        
        // Clear relevant caches
        this.clearSearchCaches();
        
        return {
          success: true,
          isNew: response.data.college.isNew,
          message: response.data.message
        };
      }
    } catch (error) {
      console.warn('API add college failed, using local storage:', error.message);
    }

    // Fallback to local storage
    const added = addDynamicCollege(trimmedName);
    return {
      success: true,
      isNew: added,
      message: added ? 'College added to local database' : 'College already exists'
    };
  }

  // Clear search-related caches
  clearSearchCaches() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes('search') || key.includes('popular') || key.includes('region')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get database statistics
  async getStats() {
    try {
      if (this.useAPI && await this.isAPIAvailable()) {
        const response = await collegeAPI.getStats();
        return response.data.stats;
      }
    } catch (error) {
      console.warn('API stats failed:', error.message);
    }

    // Fallback to static stats
    const allColleges = getAllColleges();
    return {
      total: allColleges.length,
      static: allColleges.length - (JSON.parse(localStorage.getItem('kaizen_dynamic_colleges') || '[]')).length,
      dynamic: (JSON.parse(localStorage.getItem('kaizen_dynamic_colleges') || '[]')).length,
      hyderabad: getHyderabadColleges().length
    };
  }

  // Bulk seed initial data to API
  async seedInitialData() {
    try {
      if (this.useAPI && await this.isAPIAvailable()) {
        const allColleges = getAllColleges();
        const response = await collegeAPI.bulkAdd(allColleges);
        console.log('Initial data seeded:', response.data.results);
        return response.data.results;
      }
    } catch (error) {
      console.error('Failed to seed initial data:', error);
      throw error;
    }
  }

  // Enable/disable API usage
  setAPIUsage(enabled) {
    this.useAPI = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
const collegeService = new CollegeService();

export default collegeService;

// Export individual methods for convenience
export const {
  searchColleges,
  getPopularColleges,
  getCollegesByRegion,
  addCollege,
  getStats,
  seedInitialData,
  setAPIUsage,
  clearCache
} = collegeService;
