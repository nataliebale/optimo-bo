import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'number/:number',
    loadChildren: () =>
      import(
        'apps/dashboard/src/app/pages/verify/verify-number/verify-number.module'
      ).then((m) => m.VerifyNumberModule),
  },
  {
    path: 'email/:email',
    loadChildren: () =>
      import(
        'apps/dashboard/src/app/pages/verify/verify-email/verify-email.module'
      ).then((m) => m.VerifyEmailModule),
  },
  {
    path: 'token/:token/:type',
    loadChildren: () =>
      import(
        'apps/dashboard/src/app/pages/verify/verify-token/verify-token.module'
      ).then((m) => m.VerifyTokenModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class VerifyModule {}
