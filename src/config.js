// EDUCARE SKILLS ACADEMY — Central Configuration

/**
 * Destination WhatsApp Number for Stall Enquiries
 * 
 * Format: Country code without '+' or special characters, followed by the 10-digit number.
 * Example for India: '919876543210'
 * 
 * Set to a placeholder string (e.g., 'WHATSAPP_NUMBER') when no verified number is provided.
 * When set to a placeholder, the app displays a clear notification that the WhatsApp number
 * must be configured before enquiries can be redirected.
 */
export const WHATSAPP_CONFIG = {
  // Replace 'WHATSAPP_NUMBER' with the official destination number (e.g., '91XXXXXXXXXX')
  DESTINATION_NUMBER: 'WHATSAPP_NUMBER',
};

/**
 * Checks if a valid destination WhatsApp number has been configured.
 * @returns {boolean}
 */
export function isWhatsAppConfigured() {
  const num = WHATSAPP_CONFIG.DESTINATION_NUMBER;
  if (!num) return false;
  const clean = String(num).trim();
  if (clean === 'WHATSAPP_NUMBER' || clean === 'YOUR_WHATSAPP_NUMBER') {
    return false;
  }
  // Must be at least 10 digits and only numeric
  return clean.length >= 10 && /^\d+$/.test(clean);
}

/**
 * Returns the cleaned destination WhatsApp number if configured.
 * @returns {string|null}
 */
export function getWhatsAppNumber() {
  return isWhatsAppConfigured() ? String(WHATSAPP_CONFIG.DESTINATION_NUMBER).trim() : null;
}
