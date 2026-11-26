// ===== إعدادات التطبيق / App settings =====
// CONNECTOR: "demo" (بيانات تجريبية) أو "ainsoft" (الربط الحقيقي)
// الأسرار (المفتاح) بتتحط في متغيرات البيئة (.env) مش هنا.
module.exports = {
  CONNECTOR: process.env.CONNECTOR || 'demo',
  PORT: process.env.PORT || 3000,
  // Ainsoft (بتتعبّى لما ناخد وثائق الـ API من الشركة)
  AINSOFT: {
    BASE_URL: process.env.AINSOFT_BASE_URL || '',      // مثال: https://api.example.com
    TRACK_PATH: process.env.AINSOFT_TRACK_PATH || '/track?awb={awb}', // حسب الوثائق
    API_KEY: process.env.AINSOFT_API_KEY || '',        // سري: ما يتكتبش في الكود
    AUTH_HEADER: process.env.AINSOFT_AUTH_HEADER || 'Authorization', // أو X-API-Key
    AUTH_PREFIX: process.env.AINSOFT_AUTH_PREFIX || 'Bearer ',       // أو '' حسب الوثائق
    TIMEOUT_MS: 8000,
  },
  RATE_LIMIT_PER_MIN: 20, // طلبات لكل IP في الدقيقة
};
