export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Features
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  enableSentry: process.env.NEXT_PUBLIC_ENABLE_SENTRY === "true",

  // File Upload
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"), // 10MB
  allowedFileTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(",") || [
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "png",
  ],

  // Authentication
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
} as const;
