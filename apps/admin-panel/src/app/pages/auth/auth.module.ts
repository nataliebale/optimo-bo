import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'offers',
    loadChildren: () =>
      import('./offers/offers.module').then((m) => m.OffersModule),
  },
  {
    path: 'business-types',
    loadChildren: () =>
      import('./business-types/business-types.module').then(
        (m) => m.BusinessTypesModule
      ),
  },
  {
    path: 'catalogue',
    loadChildren: () =>
      import('./catalogue/catalogue.module').then((m) => m.CatalogueModule),
  },
  {
    path: 'suppliers',
    loadChildren: () =>
      import('./distributors/distributors.module').then(
        (m) => m.DistributorsModule
      ),
  },
  {
    path: 'supplier-users',
    loadChildren: () =>
      import('./supplier-users/supplier-users.module').then(
        (m) => m.SupplierUsersModule
      ),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'legal-entities',
    loadChildren: () =>
      import('./legal-entities/legal-entities.module').then(
        (m) => m.LegalEntitiesModule
      ),
  },
  {
    path: 'registration-requests',
    loadChildren: () =>
      import('./registration-requests/registration-requests.module').then(
        (m) => m.RegistrationRequestsModule
      ),
  },
  {
    path: 'demo-requests',
    loadChildren: () =>
      import('./demo-requests/demo-requests.module').then(
        (m) => m.DemoRequestsModule
      ),
  },
  {
    path: 'devices',
    loadChildren: () =>
      import('./devices/devices.module').then((m) => m.DevicesModule),
  },
  {
    path: 'admins',
    loadChildren: () =>
      import('./admins/admins.module').then((m) => m.AdminsModule),
  },
  {
    path: 'faqs',
    loadChildren: () => import('./faqs/faqs.module').then((m) => m.FAQsModule),
  },
  {
    path: 'faq-categories',
    loadChildren: () =>
      import('./faq-categories/faq-categories.module').then(
        (m) => m.FAQCategoriesModule
      ),
  },
  {
    path: 'video-tutorials',
    loadChildren: () =>
      import('./video-tutorials/video-tutorials.module').then(
        (m) => m.VideoTutorialsModule
      ),
  },
  {
    path: 'applications',
    loadChildren: () =>
      import('./applications/applications.module').then(
        (m) => m.ApplicationsModule
      ),
  },
  {
    path: 'attributes',
    loadChildren: () =>
      import('./attributes/attributes.module').then(
        (m) => m.AttributesModule
      ),
  },
  {
    path: 'attribute-categories', loadChildren: () =>
      import('./attributes/attribute-categories/attribute-categories.module').then(
        m => m.AttributeCategoriesModule
      ),
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then((m) => m.HelpModule),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./notifications/notifications.module').then((m) => m.NotificationsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AuthModule {}
