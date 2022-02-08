export interface Category {
  id: number;
  icon: string;
  urlSlug: string;
  name: string;
  sortIndex: number;
}

export const CATEGORIES_MOCK: Category[] = [
  {
    id: 1,
    name: 'FAQPage.Categories.general',
    icon: 'control',
    urlSlug: 'general',
    sortIndex: 0,
  },
  {
    id: 2,
    name: 'FAQPage.Categories.packages',
    icon: 'flag',
    urlSlug: 'packages',
    sortIndex: 1,
  },
  {
    id: 3,
    name: 'FAQPage.Categories.managers',
    icon: 'integration',
    urlSlug: 'managers',
    sortIndex: 2,
  },
  {
    id: 4,
    name: 'FAQPage.Categories.operators',
    icon: 'statistics',
    urlSlug: 'operators',
    sortIndex: 3,
  },
];

export function getCategoryIdBySlug(categorySlug: string): number {
  return CATEGORIES_MOCK.find((category) => category.urlSlug === categorySlug)
    .id;
}

export function getCategorySlugById(id: number): string {
  return CATEGORIES_MOCK.find((category) => category.id === id).urlSlug;
}
