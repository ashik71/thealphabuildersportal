import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { shareholderGuard } from './guards/shareholder.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'view/:token',
    loadComponent: () => import('./projects/view-link/view-link.component').then((m) => m.ViewLinkComponent),
  },
  {
    // Public: the invitee has no account yet, so this cannot sit behind a guard.
    path: 'accept-invite/:token',
    loadComponent: () =>
      import('./auth/accept-invite/accept-invite.component').then((m) => m.AcceptInviteComponent),
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./portal/portal-layout/portal-layout.component').then((m) => m.PortalLayoutComponent),
    canActivate: [authGuard, shareholderGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'projects' },
      {
        path: 'projects',
        loadComponent: () =>
          import('./portal/portal-dashboard/portal-dashboard.component').then(
            (m) => m.PortalDashboardComponent
          ),
      },
      {
        path: 'projects/:projectId',
        loadComponent: () =>
          import('./portal/portal-project-detail/portal-project-detail.component').then(
            (m) => m.PortalProjectDetailComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./projects/project-list/project-list.component').then((m) => m.ProjectListComponent),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./projects/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
      },
      {
        path: 'shareholders',
        loadComponent: () =>
          import('./shareholders/shareholder-list/shareholder-list.component').then(
            (m) => m.ShareholderListComponent
          ),
      },
      {
        path: 'cost-categories',
        loadComponent: () =>
          import('./cost-categories/cost-category-list/cost-category-list.component').then(
            (m) => m.CostCategoryListComponent
          ),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
