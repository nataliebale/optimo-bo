export const MENU_TREE: any = [
  {
    path: '/home',
    text: 'მთავარი',
    icon: 'main-admin',
  },
  {
    path: '/users',
    icon: 'users-admin',
    text: 'მომხმარებლები',
  },
  {
    path: '/legal-entities',
    icon: 'companies-admin',
    text: 'კომპანიები',
  },
  {
    path: '/devices',
    icon: 'devices-admin',
    text: 'მოწყობილობები',
  },
  {
    path: '/registration-requests',
    icon: 'registrations-admin',
    text: 'რეგისტრაციის მოთხოვნები',
  },
  {
    path: '/demo-requests',
    icon: 'demos-admin',
    text: 'დემო მოთხოვნები',
  },
  {
    path: '/business-types',
    icon: 'businesses-types-admin',
    text: 'ბიზნეს ტიპები',
  },
  // {
  //   path: '/faqs',
  //   icon: 'faq-admin',
  //   text: 'FAQ',
  // },
  {
    text: 'FAQ',
    icon: 'faq-admin',
    children: [
      {
        text: 'FAQ კატეგორიები',
        path: '/faq-categories',
      },
      {
        text: 'FAQ',
        path: '/faqs',
      },
    ],
  },
  {
    text: 'შეთავაზებები',
    icon: 'offers-admin',
    children: [
      {
        text: 'შეთავაზებები',
        path: '/offers',
      },
      {
        text: 'განაცხადები',
        path: '/applications',
      },
    ],
  },
  {
    path: '/catalogue',
    icon: 'catalogue-admin',
    text: 'კატალოგი',
  },
  {
    text: 'ატრიბუტები',
    icon: 'attributes-admin',
    children: [
      {
        text: 'კატეგორიები',
        path: '/attribute-categories',
      },
      {
        text: 'ატრიბუტები',
        path: '/attributes',
      },
    ],
  },
  {
    icon: 'suppliers-admin',
    text: 'მომწოდებლები',
    children: [
      {
        text: 'მომწოდებლები',
        path: '/suppliers',
      },
      {
        text: 'მომხმარებლები',
        path: '/supplier-users',
      },
    ],
  },
  {
    path: '/notifications',
    icon: 'notification-admin',
    text: 'შეტყობინებები',
  },
  {
    path: '/admins',
    icon: 'admins',
    text: 'ადმინისტრატორები',
  },
  {
    path: '/video-tutorials',
    icon: 'video-lessons-admin',
    text: 'ვიდეო გაკვეთილები',
  },
  // {
  //   path: '/help',
  //   text: 'დახმარება',
  //   icon: 'tutorials-admin',
  // },
];
