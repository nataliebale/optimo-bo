import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnauthGuard } from './core/services/guards/unauth.guard';
import { AuthGuard } from './core/services/guards/auth.guard';
import { AuthorizedLayoutComponent } from './layouts/authorized-layout/authorized-layout.component';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [UnauthGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'access-token/:accessToken',
    canActivate: [UnauthGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: '',
    component: AuthorizedLayoutComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
