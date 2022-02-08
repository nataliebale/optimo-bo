import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'suppliers',
  },
  {
    path: 'suppliers',
    loadChildren: () =>
      import('./suppliers/suppliers.modele').then((m) => m.SuppliersModule),
  },
  {
    path: 'branch',
    loadChildren: () =>
      import('./branch/branch.module').then((m) => m.BranchModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AuthModule {}
