export interface INestedMenuItem {
  text: string;
  children?: this[];
  path?: string;
  checkGlovoIntegration?: boolean;
  icon?: string;
  decisionField?: string;
  alt?: string;
  isVisibleForAllLocations?: any; // depricated will be removed
}

// mock
// {
//   path: '/business-types',
//   icon: 'sidebar-admin',
//   text: 'ბიზნეს ტიპები',
// }
// ||
// {
//   // path: '/faqs',
//   icon: 'offers-admin',
//   text: 'FAQ',
//   children: [
//     {
//       text: 'FAQ',
//       path: '/faqs',
//     },
//     {
//       text: 'FAQ Categories',
//       path: '/faq-categories',
//     },
//   ],
// },
