export interface ExamModuleMeta {
  section: number;
  ordinal: string;
  title: string;
  durationLabel: string;
  coverImageUrl: string;
  tip: string;
}

export const EXAM_MODULES: ExamModuleMeta[] = [
  {
    section: 1,
    ordinal: 'أولاً',
    title: 'المهارات والتركيز والذاكرة البصرية',
    durationLabel: '3 دقائق',
    coverImageUrl: '/exam-images/module_1_cover.jpg',
    tip: 'ركّز جيداً في التفاصيل البصرية، مواقع الأشكال، وعدّ العناصر بدقة قبل انتهاء المؤقت.'
  },
  {
    section: 2,
    ordinal: 'ثانياً',
    title: 'الذكاء التخيلي والتفكير المنطقي',
    durationLabel: '7 دقائق',
    coverImageUrl: '/exam-images/module_2_cover.jpg',
    tip: 'اقرأ كل موقف بتمعن وفكّر في الاستنتاج المنطقي الأدق والأوضح.'
  },
  {
    section: 3,
    ordinal: 'ثالثاً',
    title: 'الحسابات الذهنية',
    durationLabel: '5 دقائق',
    coverImageUrl: '/exam-images/module_3_cover.jpg',
    tip: 'أجرِ العمليات الحسابية ذهنياً بهدوء وأدخل القيمة الرقمية الصحيحة.'
  },
  {
    section: 4,
    ordinal: 'رابعاً',
    title: 'تحليل الشخصية',
    durationLabel: '5 دقائق',
    coverImageUrl: '/exam-images/module_4_cover.jpg',
    tip: 'اختر الاستجابة الأقرب لطبيعتك وتصرفك الحقيقي في المواقف اليومية.'
  }
];

export function getModuleMeta(section: number): ExamModuleMeta {
  return (
    EXAM_MODULES.find((m) => m.section === section) ?? {
      section,
      ordinal: `المرحلة ${section}`,
      title: 'مرحلة الاختبار',
      durationLabel: '5 دقائق',
      coverImageUrl: '/exam-images/cover_hero.jpg',
      tip: 'أجب عن كل سؤال قبل انتهاء المؤقت.'
    }
  );
}
