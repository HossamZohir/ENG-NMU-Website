import type { Lang } from '@/types'

// ── Language persistence ──────────────────────────────────────────────────────
const LANG_KEY = 'nmu_lang'

export function getLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang) || 'en'
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.body.classList.toggle('ar', lang === 'ar')
  const fontFamily =
    lang === 'ar' ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif"
  document.body.style.fontFamily = fontFamily
}

// ── Translations ──────────────────────────────────────────────────────────────
const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.programs': 'Programs',
    'nav.faculty': 'Faculty',
    'nav.departments': 'Departments',
    'nav.research': 'Research',
    'nav.news': 'News',
    'nav.events': 'Events',
    'nav.gallery': 'Gallery',
    'nav.downloads': 'Downloads',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin Panel',

    // Common
    'common.learnMore': 'Learn More',
    'common.viewAll': 'View All',
    'common.readMore': 'Read More',
    'common.download': 'Download',
    'common.apply': 'Apply Now',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found.',
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add New',
    'common.upload': 'Upload',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.published': 'Published',
    'common.draft': 'Draft',
    'common.required': 'Required',
    'common.optional': 'Optional',

    // Home
    'home.badge': 'New Mansoura University · Est. 2019',
    'home.hero.title': "Shaping Tomorrow's Engineers Today",
    'home.hero.subtitle':
      "Join Egypt's most innovative engineering faculty. World-class programs, cutting-edge research, and industry partnerships that prepare you for a global career.",
    'home.hero.cta': 'Explore Programs',
    'home.hero.cta2': 'Learn More',
    'home.stats.programs': 'Academic Programs',
    'home.stats.faculty': 'Faculty Members',
    'home.stats.students': 'Students',
    'home.stats.labs': 'Research Labs',
    'home.stats.partners': 'Industry Partners',
    'home.stats.publications': 'Publications',
    'home.dean.badge': "Dean's Message",
    'home.dean.title': 'Welcome to the Faculty of Engineering',
    'home.programs.eyebrow': 'Academic Programs',
    'home.programs.title': 'Engineering Excellence Across 7 Disciplines',
    'home.programs.subtitle':
      'Choose from our cutting-edge programs designed for the future of technology and innovation.',
    'home.programs.viewAll': 'View All Programs',
    'home.news.eyebrow': 'Latest News',
    'home.news.title': 'Stay Updated',
    'home.news.subtitle':
      'The latest news, events, and announcements from the Faculty of Engineering.',

    // About
    'about.eyebrow': 'About the Faculty',
    'about.title': 'A Legacy of Engineering Excellence',
    'about.subtitle':
      "Founded in 2019, the Faculty of Engineering at New Mansoura University has rapidly established itself as a centre of excellence in engineering education and research.",
    'about.vision': 'Our Vision',
    'about.mission': 'Our Mission',
    'about.values': 'Our Values',
    'about.history': 'Our History',
    'about.goals': 'Strategic Goals',

    // Programs
    'programs.eyebrow': 'Academic Programs',
    'programs.title': '7 Engineering Programs',
    'programs.subtitle':
      'World-class engineering education designed for the future. Choose your path and shape the world.',
    'programs.duration': 'Duration',
    'programs.credits': 'Credit Hours',
    'programs.degree': 'Degree',
    'programs.language': 'Language',
    'programs.overview': 'Overview',
    'programs.outcomes': 'Learning Outcomes',
    'programs.curriculum': 'Curriculum',
    'programs.careers': 'Career Paths',
    'programs.labs': 'Laboratories',
    'programs.coordinator': 'Program Coordinator',
    'programs.downloadPlan': 'Download Study Plan',

    // Faculty
    'faculty.eyebrow': 'Our Faculty',
    'faculty.title': 'Distinguished Faculty Members',
    'faculty.subtitle':
      'World-class academics and researchers dedicated to your success.',
    'faculty.search': 'Search faculty members...',
    'faculty.allDepts': 'All Departments',
    'faculty.profile.bio': 'Biography',
    'faculty.profile.research': 'Research Interests',
    'faculty.profile.publications': 'Publications',
    'faculty.profile.contact': 'Contact',
    'faculty.profile.office': 'Office',
    'faculty.profile.hours': 'Office Hours',

    // News
    'news.eyebrow': 'Faculty News',
    'news.title': 'Latest News & Announcements',
    'news.search': 'Search articles...',

    // Events
    'events.eyebrow': 'Events',
    'events.title': 'Upcoming Events',
    'events.register': 'Register Now',
    'events.location': 'Location',
    'events.date': 'Date',

    // Contact
    'contact.eyebrow': 'Get in Touch',
    'contact.title': 'Contact the Faculty',
    'contact.form.title': 'Send a Message',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email Address',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send Message',
    'contact.form.success': 'Your message has been sent successfully!',
    'contact.info.title': 'Contact Information',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.hours': 'Office Hours',

    // Admin – Login
    'admin.login.title': 'Admin Login',
    'admin.login.subtitle': 'Faculty of Engineering CMS',
    'admin.login.email': 'Email Address',
    'admin.login.password': 'Password',
    'admin.login.submit': 'Sign In',
    'admin.login.error': 'Invalid email or password.',
    'admin.login.loading': 'Signing in...',

    // Admin – General
    'admin.dashboard': 'Dashboard',
    'admin.homepage': 'Homepage',
    'admin.programs': 'Programs',
    'admin.members': 'Faculty Members',
    'admin.news': 'News',
    'admin.events': 'Events',
    'admin.research': 'Research',
    'admin.downloads': 'Downloads',
    'admin.gallery': 'Gallery',
    'admin.contact': 'Contact Info',
    'admin.users': 'Users',
    'admin.settings': 'Settings',
    'admin.logout': 'Sign Out',
    'admin.welcome': 'Welcome back',
    'admin.saved': 'Changes saved successfully!',
    'admin.deleted': 'Item deleted.',
    'admin.confirmDelete': 'Are you sure you want to delete this item?',

    // Footer
    'footer.rights': '© 2025 New Mansoura University — Faculty of Engineering. All rights reserved.',
    'footer.programs': 'Programs',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.follow': 'Follow Us',
  },

  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'عن الكلية',
    'nav.programs': 'البرامج',
    'nav.faculty': 'أعضاء هيئة التدريس',
    'nav.departments': 'الأقسام',
    'nav.research': 'البحث العلمي',
    'nav.news': 'الأخبار',
    'nav.events': 'الفعاليات',
    'nav.gallery': 'معرض الصور',
    'nav.downloads': 'التنزيلات',
    'nav.contact': 'تواصل معنا',
    'nav.admin': 'لوحة التحكم',

    // Common
    'common.learnMore': 'اعرف أكثر',
    'common.viewAll': 'عرض الكل',
    'common.readMore': 'اقرأ المزيد',
    'common.download': 'تنزيل',
    'common.apply': 'تقدم الآن',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.all': 'الكل',
    'common.loading': 'جاري التحميل...',
    'common.noResults': 'لا توجد نتائج.',
    'common.save': 'حفظ التغييرات',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة جديد',
    'common.upload': 'رفع',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.prev': 'السابق',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.active': 'نشط',
    'common.inactive': 'غير نشط',
    'common.published': 'منشور',
    'common.draft': 'مسودة',
    'common.required': 'مطلوب',
    'common.optional': 'اختياري',

    // Home
    'home.badge': 'جامعة المنصورة الجديدة · تأسست 2019',
    'home.hero.title': 'نُشكِّل مهندسي الغد اليوم',
    'home.hero.subtitle':
      'انضم إلى كلية الهندسة الأكثر ابتكاراً في مصر. برامج عالمية المستوى، أبحاث متطورة، وشراكات صناعية تُهيئك لمسيرة مهنية دولية.',
    'home.hero.cta': 'استكشف البرامج',
    'home.hero.cta2': 'اعرف أكثر',
    'home.stats.programs': 'برنامج أكاديمي',
    'home.stats.faculty': 'عضو هيئة تدريس',
    'home.stats.students': 'طالب',
    'home.stats.labs': 'مختبر بحثي',
    'home.stats.partners': 'شريك صناعي',
    'home.stats.publications': 'منشور علمي',
    'home.dean.badge': 'كلمة العميد',
    'home.dean.title': 'مرحباً بكم في كلية الهندسة',
    'home.programs.eyebrow': 'البرامج الأكاديمية',
    'home.programs.title': 'التميز الهندسي عبر ٧ تخصصات',
    'home.programs.subtitle':
      'اختر من بين برامجنا الهندسية المتطورة المصممة لمستقبل التكنولوجيا والابتكار.',
    'home.programs.viewAll': 'عرض جميع البرامج',
    'home.news.eyebrow': 'آخر الأخبار',
    'home.news.title': 'ابقَ على اطلاع',
    'home.news.subtitle': 'آخر الأخبار والفعاليات والإعلانات من كلية الهندسة.',

    // About
    'about.eyebrow': 'عن الكلية',
    'about.title': 'إرث من التميز الهندسي',
    'about.subtitle':
      'تأسست عام 2019، سرعان ما أرست كلية الهندسة بجامعة المنصورة الجديدة مكانتها كمركز للتميز في التعليم الهندسي والبحث العلمي.',
    'about.vision': 'رؤيتنا',
    'about.mission': 'رسالتنا',
    'about.values': 'قيمنا',
    'about.history': 'تاريخنا',
    'about.goals': 'الأهداف الاستراتيجية',

    // Programs
    'programs.eyebrow': 'البرامج الأكاديمية',
    'programs.title': '٧ برامج هندسية',
    'programs.subtitle':
      'تعليم هندسي عالمي المستوى مصمم للمستقبل. اختر مسارك وشكّل العالم.',
    'programs.duration': 'المدة',
    'programs.credits': 'الساعات المعتمدة',
    'programs.degree': 'الدرجة العلمية',
    'programs.language': 'لغة الدراسة',
    'programs.overview': 'نظرة عامة',
    'programs.outcomes': 'مخرجات التعلم',
    'programs.curriculum': 'المنهج الدراسي',
    'programs.careers': 'مسارات التوظيف',
    'programs.labs': 'المختبرات',
    'programs.coordinator': 'منسق البرنامج',
    'programs.downloadPlan': 'تنزيل الخطة الدراسية',

    // Faculty
    'faculty.eyebrow': 'هيئة التدريس',
    'faculty.title': 'أعضاء هيئة التدريس المتميزون',
    'faculty.subtitle': 'أكاديميون وباحثون من الطراز العالمي مكرسون لنجاحك.',
    'faculty.search': 'ابحث عن أعضاء هيئة التدريس...',
    'faculty.allDepts': 'جميع الأقسام',
    'faculty.profile.bio': 'السيرة الذاتية',
    'faculty.profile.research': 'مجالات البحث',
    'faculty.profile.publications': 'المنشورات العلمية',
    'faculty.profile.contact': 'التواصل',
    'faculty.profile.office': 'المكتب',
    'faculty.profile.hours': 'ساعات الاستقبال',

    // News
    'news.eyebrow': 'أخبار الكلية',
    'news.title': 'آخر الأخبار والإعلانات',
    'news.search': 'ابحث في المقالات...',

    // Events
    'events.eyebrow': 'الفعاليات',
    'events.title': 'الفعاليات القادمة',
    'events.register': 'سجّل الآن',
    'events.location': 'الموقع',
    'events.date': 'التاريخ',

    // Contact
    'contact.eyebrow': 'تواصل معنا',
    'contact.title': 'تواصل مع الكلية',
    'contact.form.title': 'أرسل رسالة',
    'contact.form.name': 'الاسم الكامل',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.subject': 'الموضوع',
    'contact.form.message': 'الرسالة',
    'contact.form.send': 'إرسال الرسالة',
    'contact.form.success': 'تم إرسال رسالتك بنجاح!',
    'contact.info.title': 'معلومات التواصل',
    'contact.address': 'العنوان',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.hours': 'ساعات العمل',

    // Admin – Login
    'admin.login.title': 'تسجيل دخول المشرف',
    'admin.login.subtitle': 'نظام إدارة محتوى كلية الهندسة',
    'admin.login.email': 'البريد الإلكتروني',
    'admin.login.password': 'كلمة المرور',
    'admin.login.submit': 'تسجيل الدخول',
    'admin.login.error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'admin.login.loading': 'جاري تسجيل الدخول...',

    // Admin – General
    'admin.dashboard': 'لوحة التحكم',
    'admin.homepage': 'الصفحة الرئيسية',
    'admin.programs': 'البرامج',
    'admin.members': 'أعضاء هيئة التدريس',
    'admin.news': 'الأخبار',
    'admin.events': 'الفعاليات',
    'admin.research': 'البحث العلمي',
    'admin.downloads': 'التنزيلات',
    'admin.gallery': 'معرض الصور',
    'admin.contact': 'معلومات التواصل',
    'admin.users': 'المستخدمون',
    'admin.settings': 'الإعدادات',
    'admin.logout': 'تسجيل الخروج',
    'admin.welcome': 'مرحباً بعودتك',
    'admin.saved': 'تم حفظ التغييرات بنجاح!',
    'admin.deleted': 'تم الحذف.',
    'admin.confirmDelete': 'هل أنت متأكد من حذف هذا العنصر؟',

    // Footer
    'footer.rights': '© 2025 جامعة المنصورة الجديدة — كلية الهندسة. جميع الحقوق محفوظة.',
    'footer.programs': 'البرامج',
    'footer.links': 'روابط سريعة',
    'footer.contact': 'تواصل',
    'footer.follow': 'تابعنا',
  },
}

// ── t() function ──────────────────────────────────────────────────────────────
export function t(key: string): string {
  const lang = getLang()
  return translations[lang][key] ?? translations['en'][key] ?? key
}

// ── Initialise on load ────────────────────────────────────────────────────────
export function initLang(): void {
  const lang = getLang()
  setLang(lang)
}
