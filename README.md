# برنامج استثمار عقاري (إصدار أولي)

هذا مشروع مبدئي لبرنامج استثمار عقاري شامل (واجهة برمجية Back-end) مبني على FastAPI مع SQLite. يحتوي على:

- التوثيق والدخول باستخدام JWT
- إدارة العقارات والوحدات والمصروفات
- إدارة الصفقات والاستثمارات
- حزمة حسابات مالية (IRR, NPV, Cap rate, Cash-on-cash, DSCR, Amortization)
- توثيق تلقائي عبر Swagger UI على المسار `/docs`

## المتطلبات
- Python 3.11+

## التشغيل سريعًا

1) تثبيت الحزم:

```bash
cd backend
pip install -r requirements.txt
```

2) تشغيل الخادم:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3) التصفح:
- واجهة التوثيق: http://localhost:8000/docs

## خطوات أساسية للاستخدام
1) تسجيل مستخدم جديد: `POST /auth/register`
2) تسجيل الدخول للحصول على توكن: `POST /auth/login` (استخدم `username`=الإيميل و`password` كلمة المرور)
3) استخدم التوكن في عمليات CRUD على:
   - العقارات: `/properties`
   - الصفقات والاستثمارات: `/deals`
4) الحسابات المالية عبر `/calc`

## ملاحظات
- قاعدة البيانات SQLite محلية (`realestate.db`).
- في الإنتاج يفضل PostgreSQL وKYC/Payments وتخزين ملفات S3.
- يمكن إضافة واجهة أمامية لاحقًا (مثلاً Next.js) مع نفس الواجهات. 
