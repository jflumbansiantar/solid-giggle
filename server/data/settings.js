/**
 * Application-wide settings stored in MongoDB.
 * Each entry is a { key, value } document.
 *
 * usdToIdr — exchange rate used by the frontend to display values in IDR.
 *            Update this via PATCH /api/settings/usdToIdr to keep it current.
 */
const settings = [
  { key: 'usdToIdr', value: 16250 },
];

module.exports = settings;
