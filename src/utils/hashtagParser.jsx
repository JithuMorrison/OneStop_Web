/**
 * Hashtag parser utility for extracting event information from announcement hashtags
 * Format: #type_eventName_startDate_endDate
 * Date format: dd-mm-yyyy
 */

/**
 * Parse hashtag to extract event information
 * @param {string} hashtag - Hashtag in format #type_eventName_DD-MM-YYYY_DD-MM-YYYY
 * @returns {Object} Parsed event data with type, name, startDate, endDate
 * @throws {Error} If hashtag format is invalid
 */
export const parseHashtag = (hashtag) => {
  if (!hashtag || typeof hashtag !== 'string') {
    throw new Error('Hashtag must be a non-empty string');
  }

  // Remove # if present
  const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;

  // Split by underscore
  const parts = cleanHashtag.split('_');

  if (parts.length !== 4) {
    throw new Error('Hashtag must follow format: #type_eventName_startDate_endDate');
  }

  const [type, eventName, startDateStr, endDateStr] = parts;

  // Validate type is not empty
  if (!type || type.trim() === '') {
    throw new Error('Event type cannot be empty');
  }

  // Validate event name is not empty
  if (!eventName || eventName.trim() === '') {
    throw new Error('Event name cannot be empty');
  }

  // Parse dates
  const startDate = parseDateString(startDateStr);
  const endDate = parseDateString(endDateStr);

  // Validate date order
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  return {
    type: type.trim(),
    name: eventName.trim(),
    startDate,
    endDate
  };
};

/**
 * Parse date string in dd-mm-yyyy format
 * @param {string} dateStr - Date string in dd-mm-yyyy format
 * @returns {Date} Parsed date object
 * @throws {Error} If date format is invalid
 */
const parseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error('Date must be a non-empty string');
  }

  const dateParts = dateStr.split('-');

  if (dateParts.length !== 3) {
    throw new Error('Date must be in format dd-mm-yyyy');
  }

  const [day, month, year] = dateParts.map(part => parseInt(part, 10));

  // Validate numeric values
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error('Date parts must be numeric');
  }

  // Validate ranges
  if (day < 1 || day > 31) {
    throw new Error('Day must be between 1 and 31');
  }

  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }

  if (year < 1900 || year > 2100) {
    throw new Error('Year must be between 1900 and 2100');
  }

  // Create date object (month is 0-indexed in JavaScript)
  const date = new Date(year, month - 1, day);

  // Validate the date is valid (handles cases like 31-02-2024)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    throw new Error('Invalid date');
  }

  return date;
};

/**
 * Validate hashtag format without parsing
 * @param {string} hashtag - Hashtag to validate
 * @returns {boolean} True if valid format, false otherwise
 */
export const validateHashtagFormat = (hashtag) => {
  try {
    parseHashtag(hashtag);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Format date to dd-mm-yyyy string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export const formatDateString = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date object');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Create hashtag from event data
 * @param {Object} eventData - Event data with type, name, startDate, endDate
 * @returns {string} Formatted hashtag
 */
export const createHashtag = (eventData) => {
  const { type, name, startDate, endDate } = eventData;

  if (!type || !name || !startDate || !endDate) {
    throw new Error('All event fields are required');
  }

  const startDateStr = formatDateString(startDate);
  const endDateStr = formatDateString(endDate);

  return `#${type}_${name}_${startDateStr}_${endDateStr}`;
};

export default {
  parseHashtag,
  validateHashtagFormat,
  formatDateString,
  createHashtag
};
