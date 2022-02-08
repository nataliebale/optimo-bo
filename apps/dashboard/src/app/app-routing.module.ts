import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnauthGuard } from './core/services/guards/unauth.guard';
import { ChangePasswordGuard } from './core/services/guards/change-password.guard';
import { AuthGuard } from './core/services/guards/auth.guard';
import { AuthorizedLayoutComponent } from './layouts/authorized-layout/authorized-layout.component';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [UnauthGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'change-password',
    canActivate: [UnauthGuard, ChangePasswordGuard],
    loadChildren: () =>
      import('./pages/change-password/change-password.module').then(
        (m) => m.ChangePasswordModule
      ),
  },
  {
    path: 'access-token/:accessToken',
    canActivate: [UnauthGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'register',
    canActivate: [UnauthGuard],
    loadChildren: () =>
      import('./pages/register/register.module').then((m) => m.RegisterModule),
  },
  {
    path: 'verify',
    loadChildren: () =>
      import('./pages/verify/verify.module').then((m) => m.VerifyModule),
  },
  {
    path: 'reset-password',
    canActivate: [UnauthGuard],
    loadChildren: () =>
      import('./pages/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordModule
      ),
  },
  // {
  //   path: 'public',
  //   loadChildren: () =>
  //     import('./pages/public/public.module').then(m => m.PublicModule)
  // },
  {
    path: 'print-barcode',
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/print-barcode/print-barcode.module').then(
        m => m.PrintBarcodeModule
      )
  },
  {
    path: '',
    component: AuthorizedLayoutComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
