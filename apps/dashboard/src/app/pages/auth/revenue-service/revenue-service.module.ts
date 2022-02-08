import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'waybills',
    loadChildren: () =>
      import(
        'apps/dashboard/src/app/pages/auth/revenue-service/waybills/waybills.module'
      ).then((m) => m.WaybillsModule),
  },
  { path: '**', redirectTo: 'waybills' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class RevenueServiceModule {}
