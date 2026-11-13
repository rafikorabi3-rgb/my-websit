/* Rafik Framework — قوالب مساحات العمل
   كل قالب جدول قابل لإعادة الاستخدام: تُنشأ منه نسخ مؤرخة، وتبقى الصفوف الافتراضية نقطة بداية فقط.
   صيغة الخيارات: [القيمة، النص، النبرة]. النبرة: pos | neg | neu | unk */
(() => {
  const TREND = [['up', 'صاعد', 'pos'], ['down', 'هابط', 'neg'], ['flat', 'عرضي', 'neu'], ['unk', 'غير محسوم', 'unk']];
  const IMPACT = [['sup', 'داعم', 'pos'], ['prs', 'ضاغط', 'neg'], ['neu', 'محايد', 'neu'], ['unk', 'غير محسوم', 'unk']];
  const CHANGE = [['up', 'أعلى', 'neu'], ['down', 'أدنى', 'neu'], ['same', 'ثابت', 'neu'], ['unk', 'غير محسوم', 'unk']];
  const CONF = [['low', 'منخفضة', 'neg'], ['mid', 'متوسطة', 'neu'], ['high', 'عالية', 'pos']];
  const IMPORTANCE = [['high', 'عالية', 'neg'], ['mid', 'متوسطة', 'neu'], ['low', 'منخفضة', 'unk']];
  const REL = [['inv', 'عكسية', 'neg'], ['dir', 'طردية', 'pos'], ['mix', 'متغيرة', 'neu'], ['unk', 'غير محسومة', 'unk']];
  const REGIME = [
    ['unk', 'غير محسوم', 'unk'],
    ['g+i-', 'نمو قوي وتضخم منخفض', 'neu'],
    ['g+i+', 'نمو قوي وتضخم مرتفع', 'neu'],
    ['g-i+', 'نمو ضعيف وتضخم مرتفع', 'neu'],
    ['g-i-', 'نمو ضعيف وتضخم منخفض', 'neu'],
  ];
  const rows = (key, names, extra = {}) => names.map(n => ({ [key]: n, ...extra }));

  window.RF_TEMPLATES = {
    sheets: [
      {
        id: 'market-map', title: 'خريطة مقارنة الأسواق', rowLabel: 'سوق',
        purpose: 'صف لكل سوق: اتجاهه، ما يحركه، وعلاقته الحالية بالذهب. الهدف رؤية الأسواق جنباً إلى جنب لا تحليل كل سوق منفرداً.',
        fields: [],
        cols: [
          { key: 'market', label: 'السوق', type: 'text', w: 170 },
          { key: 'trend', label: 'الاتجاه', type: 'select', options: TREND, w: 120 },
          { key: 'driver', label: 'المحرك الرئيسي', type: 'area', w: 220 },
          { key: 'rel', label: 'العلاقة بالذهب الآن', type: 'select', options: REL, w: 130 },
          { key: 'level', label: 'مستوى مهم', type: 'text', w: 120 },
          { key: 'note', label: 'ملاحظة', type: 'area', w: 220 },
        ],
        rows: rows('market', ['الذهب XAU/USD', 'مؤشر الدولار DXY', 'عائد 10 سنوات الأمريكي', 'العائد الحقيقي 10 سنوات (TIPS)', 'S&P 500', 'النفط (برنت)', 'USD/JPY']),
      },
      {
        id: 'risk-matrix', title: 'مصفوفة المخاطر', rowLabel: 'خطر', summary: 'risk',
        purpose: 'قيّم كل خطر باحتمال وأثر من 1 إلى 5. الدرجة حاصل ضربهما. إشارة الإنذار المبكر هي ما ستراقبه قبل أن يتحقق الخطر.',
        fields: [],
        cols: [
          { key: 'risk', label: 'الخطر', type: 'area', w: 220 },
          { key: 'like', label: 'الاحتمال 1–5', type: 'num', min: 1, max: 5, w: 90 },
          { key: 'impact', label: 'الأثر 1–5', type: 'num', min: 1, max: 5, w: 90 },
          { key: '_score', label: 'الدرجة', type: 'calc', w: 70 },
          { key: 'assets', label: 'الأصول المتأثرة', type: 'text', w: 160 },
          { key: 'signal', label: 'إشارة الإنذار المبكر', type: 'area', w: 200 },
          { key: 'plan', label: 'خطة التعامل', type: 'area', w: 200 },
        ],
        rows: rows('risk', ['مفاجأة تضخم أعلى من التوقعات', 'تصعيد جيوسياسي', 'ضغط سيولة وقوة مفاجئة للدولار']),
      },
      {
        id: 'macro-weekly', title: 'لوحة الماكرو الأسبوعية', rowLabel: 'محور', summary: 'macro',
        purpose: 'قراءة أسبوعية ثابتة البنية. أنشئ نسخة جديدة كل أسبوع بتكرار السابقة، ثم عدّل ما تغيّر فقط.',
        fields: [
          { key: 'regime', label: 'النظام السائد', type: 'select', options: REGIME },
          { key: 'summary', label: 'خلاصة الأسبوع في ثلاثة أسطر', type: 'area' },
          { key: 'questions', label: 'أهم الأسئلة للأسبوع القادم', type: 'area' },
        ],
        cols: [
          { key: 'theme', label: 'المحور', type: 'text', w: 160 },
          { key: 'reading', label: 'القراءة الحالية', type: 'area', w: 260 },
          { key: 'change', label: 'مقارنة بالأسبوع السابق', type: 'select', options: CHANGE, w: 130 },
          { key: 'gold', label: 'الأثر على الذهب', type: 'select', options: IMPACT, w: 130 },
          { key: 'evidence', label: 'الدليل أو المصدر', type: 'area', w: 220 },
        ],
        rows: rows('theme', ['النمو', 'التضخم', 'السياسة النقدية', 'سوق العمل', 'الدولار', 'العوائد ومنحنى العائد', 'شهية المخاطرة والسيولة', 'الجيوسياسة']),
      },
      {
        id: 'event-calendar', title: 'تقويم مخاطر الأحداث', rowLabel: 'حدث', summary: 'calendar',
        purpose: 'اكتب السيناريوهين قبل الحدث، والنتيجة بعده. الأحداث التي تقع خلال سبعة أيام تظهر في الصفحة الرئيسية.',
        fields: [],
        cols: [
          { key: 'date', label: 'التاريخ', type: 'date', w: 140 },
          { key: 'event', label: 'الحدث', type: 'area', w: 210 },
          { key: 'region', label: 'المنطقة', type: 'text', w: 130 },
          { key: 'importance', label: 'الأهمية', type: 'select', options: IMPORTANCE, w: 110 },
          { key: 'expected', label: 'التوقعات', type: 'text', w: 100 },
          { key: 'previous', label: 'السابق', type: 'text', w: 100 },
          { key: 'ifHigher', label: 'إذا جاء أعلى من التوقعات', type: 'area', w: 210 },
          { key: 'ifLower', label: 'إذا جاء أقل من التوقعات', type: 'area', w: 210 },
          { key: 'gold', label: 'الأثر المحتمل على الذهب', type: 'area', w: 200 },
          { key: 'result', label: 'النتيجة بعد الحدث', type: 'area', w: 200 },
        ],
        rows: rows('event', ['مؤشر أسعار المستهلك الأمريكي (CPI)', 'تقرير الوظائف غير الزراعية (NFP)', 'اجتماع الاحتياطي الفيدرالي (FOMC)', 'مؤشر نفقات الاستهلاك الشخصي (PCE)'], { region: 'الولايات المتحدة', importance: 'high' }),
      },
      {
        id: 'gold-drivers', title: 'مصفوفة محركات الذهب', rowLabel: 'محرك', summary: 'gold',
        purpose: 'لكل محرك: حالته، اتجاه أثره، ووزنه. الأوزان مؤقتة وتعبّر عن افتراضك الحالي، وصافي القراءة يتغير بتغيّرها.',
        fields: [],
        cols: [
          { key: 'driver', label: 'المحرك', type: 'text', w: 190 },
          { key: 'state', label: 'الحالة الراهنة', type: 'area', w: 230 },
          { key: 'dir', label: 'الأثر', type: 'select', options: IMPACT, w: 120 },
          { key: 'weight', label: 'الوزن 1–5 (مؤقت)', type: 'num', min: 1, max: 5, w: 100 },
          { key: 'conf', label: 'الثقة', type: 'select', options: CONF, w: 110 },
          { key: 'evidence', label: 'الدليل', type: 'area', w: 210 },
          { key: 'flip', label: 'ما الذي يغيّر القراءة', type: 'area', w: 210 },
        ],
        rows: rows('driver', ['العوائد الحقيقية', 'الدولار', 'توقعات الفيدرالي', 'التضخم وتوقعاته', 'مشتريات البنوك المركزية', 'تدفقات الصناديق المتداولة', 'المراكز المضاربية (COT)', 'الجيوسياسة والطلب على الملاذ', 'الطلب الفعلي (حلي وسبائك)', 'شهية المخاطرة']),
      },
    ],
    checklists: [
      { title: 'قبل بدء التحليل', items: [
        'حدّدت السؤال الذي أحاول الإجابة عنه والأفق الزمني',
        'راجعت تقويم الأحداث للأيام السبعة المقبلة',
        'حدّثت لوحة الماكرو الأسبوعية',
        'سجّلت النظام السائد، أو كتبت أنه غير محسوم',
        'فصلت بين ما أعرفه وما أفترضه',
      ] },
      { title: 'أثناء بناء الفرضية', items: [
        'صغت الفرضية بعبارة قابلة للاختبار',
        'ربطتها بالمفاهيم الأكاديمية التي تستند إليها',
        'سجّلت دليلاً معارضاً واحداً على الأقل',
        'حدّدت شرط الإبطال قبل النظر في المستويات',
        'وضعت سيناريو بديلاً ومحفّزه',
        'حدّدت تاريخ المراجعة القادمة',
      ] },
      { title: 'قبل النشر أو التدريس', items: [
        'الأرقام والتواريخ مطابقة للمصدر',
        'ميّزت بين الحقيقة والرأي في النص',
        'ذكرت ما قد يجعل التحليل خاطئاً',
        'اللغة مفهومة لمتعلم لم يدرس الوحدة',
        'لا توجد صيغة توحي بتوصية شراء أو بيع',
      ] },
      { title: 'مراجعة بعد الحدث', items: [
        'قارنت النتيجة بالسيناريوهات المكتوبة مسبقاً',
        'حدّثت حالة الفرضية: مؤكدة، مُبطلة، أو معلّقة',
        'سجّلت ما ظهر من نقص في سجل الفجوات',
        'حدّثت أوزان المحركات إن تغيّرت',
      ] },
    ],
  };
})();
