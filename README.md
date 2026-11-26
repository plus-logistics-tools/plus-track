# Plus Logistics - تتبّع الطلب (PWA)

## تشغيل تجريبي / Run the demo
    node server.js        # يحتاج Node 18+ بدون مكتبات
    افتح http://localhost:3000   (أرقام تجريبية: PL1001 .. PL1005)

## الربط مع Ainsoft (3 خطوات)
1. من Ainsoft خد: وثائق الـ API، العنوان (Base URL)، ومفتاح قراءة فقط (يفضّل).
2. انسخ `.env.example` لـ `.env` واكتب: CONNECTOR=ainsoft + AINSOFT_BASE_URL + AINSOFT_API_KEY (+ المسار AINSOFT_TRACK_PATH وطريقة المصادقة حسب الوثائق). المفتاح بيفضل على السيرفر بس، عمره ما بيوصل للموبايل.
3. افتح `connectors/ainsoft.js` وعدّل حاجتين: `STATUS_MAP` (حالات Ainsoft -> حالاتنا) و`mapResponse()` (أسماء الحقول). خلاص.

## الأمان
- التطبيق بيرجّع حقول قليلة (الحالة، الإمارة والمنطقة، التواريخ). بدون اسم العميل أو التليفون أو المبلغ.
- حد أقصى 20 طلب/دقيقة لكل جهاز. رقم الطلب لازم يكون حروف/أرقام فقط.
- لو التاجر لازم يشوف طلباته هو بس: نضيف تسجيل دخول للتاجر ونفلتر على السيرفر (يحتاج دعم من Ainsoft لتحديد التاجر).

## Hosting
Any small server with Node (Render, Railway, a VPS) + HTTPS. HTTPS is required for "Add to Home Screen" / offline.
Replacing the connector never touches the UI: it must return {awb,status,emirate,area,updatedAt,events[]}.
Status codes: received, picked_up, at_hub, out_for_delivery, delivered, returned, postponed, cancelled.
