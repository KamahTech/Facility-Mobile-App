const fallbackApiBaseUrl = "https://kamahtech-t-facility-s1-35121300.dev.odoo.com/facility_mobile_api/v1";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || fallbackApiBaseUrl;
