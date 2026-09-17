/**
 * Indian GSTIN Validation and Parsing Engine
 * 15 characters alphanumeric format:
 * [0-9]{2} : State Code (01-38)
 * [A-Z]{5} : PAN first 5 chars
 * [0-9]{4} : PAN next 4 chars
 * [A-Z]{1} : PAN last char
 * [1-9A-Z]{1} : Entity Number
 * 'Z' : 14th char default 'Z'
 * [0-9A-Z]{1} : Check digit
 */

const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "19": "West Bengal",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh",
};

export interface GSTINValidationResult {
  isValid: boolean;
  stateCode?: string;
  stateName?: string;
  pan?: string;
  error?: string;
}

export function validateGSTIN(gstin?: string): GSTINValidationResult {
  if (!gstin || !gstin.trim()) {
    return { isValid: false, error: "GSTIN is missing" };
  }

  const cleaned = gstin.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstinRegex.test(cleaned)) {
    return { isValid: false, error: "Invalid GSTIN format (must be 15 alphanumeric characters matching standard pattern)" };
  }

  const stateCode = cleaned.substring(0, 2);
  const stateName = STATE_CODES[stateCode] || "Other State/UT";
  const pan = cleaned.substring(2, 12);

  return {
    isValid: true,
    stateCode,
    stateName,
    pan,
  };
}
