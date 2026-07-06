const fallbackApiBaseUrl = "http://192.168.1.53:8069/facility_mobile_api/v1";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackApiBaseUrl;
