/**
 * Local Storage Utility
 * Handles saving and retrieving listing data from localStorage
 */

const STORAGE_KEYS = {
  LISTINGS: 'automarket_listings',
  DRAFTS: 'automarket_drafts',
  LAST_IMPORT: 'automarket_last_import',
};

/**
 * Save all listings to localStorage
 * @param {Object[]} listings - Array of listing objects
 */
export const saveListings = (listings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    return true;
  } catch (error) {
    console.error('Error saving listings:', error);
    return false;
  }
};

/**
 * Get all listings from localStorage
 * @returns {Object[]} Array of listing objects
 */
export const getListings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting listings:', error);
    return [];
  }
};

/**
 * Save a single listing (upsert)
 * @param {Object} listing - Listing object to save
 */
export const saveListing = (listing) => {
  try {
    const listings = getListings();
    const index = listings.findIndex(l => l.id === listing.id);
    
    if (index >= 0) {
      listings[index] = { ...listing, updatedAt: new Date().toISOString() };
    } else {
      listings.push({ ...listing, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    saveListings(listings);
    return true;
  } catch (error) {
    console.error('Error saving listing:', error);
    return false;
  }
};

/**
 * Get a single listing by ID
 * @param {string} id - Listing ID
 * @returns {Object|null} Listing object or null
 */
export const getListingById = (id) => {
  const listings = getListings();
  return listings.find(l => l.id === id) || null;
};

/**
 * Delete a listing by ID
 * @param {string} id - Listing ID
 */
export const deleteListing = (id) => {
  try {
    const listings = getListings().filter(l => l.id !== id);
    saveListings(listings);
    return true;
  } catch (error) {
    console.error('Error deleting listing:', error);
    return false;
  }
};

/**
 * Get all draft listings
 * @returns {Object[]} Array of draft listings
 */
export const getDrafts = () => {
  return getListings().filter(l => l.status === 'draft');
};

/**
 * Get all published listings
 * @returns {Object[]} Array of published listings
 */
export const getPublished = () => {
  return getListings().filter(l => l.status === 'published');
};

/**
 * Update listing status
 * @param {string} id - Listing ID
 * @param {string} status - New status ('draft' | 'published')
 */
export const updateListingStatus = (id, status) => {
  const listing = getListingById(id);
  if (listing) {
    listing.status = status;
    saveListing(listing);
    return true;
  }
  return false;
};

/**
 * Save last import data (raw data and mapping)
 * @param {Object} importData - { rawData, mapping, columns, fileName }
 */
export const saveLastImport = (importData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_IMPORT, JSON.stringify(importData));
    return true;
  } catch (error) {
    console.error('Error saving import data:', error);
    return false;
  }
};

/**
 * Get last import data
 * @returns {Object|null} Import data or null
 */
export const getLastImport = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_IMPORT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting import data:', error);
    return null;
  }
};

/**
 * Clear all stored data
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Get storage usage info
 * @returns {Object} Storage info
 */
export const getStorageInfo = () => {
  try {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // UTF-16 encoding
      }
    });
    
    return {
      usedBytes: totalSize,
      usedKB: (totalSize / 1024).toFixed(2),
      usedMB: (totalSize / (1024 * 1024)).toFixed(2),
      listingsCount: getListings().length,
      draftsCount: getDrafts().length,
      publishedCount: getPublished().length,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};
