export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  const num = Number(price);
  if (num < 0) return `-₹${Math.abs(num).toLocaleString('en-IN')}`;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatProjectPrice = (val) => {
  if (val === undefined || val === null) return 'N/A';
  const num = Number(val);
  if (num < 15) return `₹${num.toFixed(2)} Cr`;
  return `₹${num.toFixed(1)} L`;
};

export const normalizeArea = (carpet_area, website) => {
  if (!carpet_area) return { sqft: 0, isSqm: false };
  if (website === 'magichomes') {
    return {
      sqft: Math.round(carpet_area * 10.7639),
      rawSqm: carpet_area,
      isSqm: true,
    };
  }
  return { sqft: carpet_area, isSqm: false };
};