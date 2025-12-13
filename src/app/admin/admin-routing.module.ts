import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent, // <-- layout here
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },

      {
        path: 'projects',
        loadChildren: () =>
          import('../projects/projects.module').then(m => m.ProjectsModule),
      },

      // {
      //   path: 'categories',
      //   loadChildren: () =>
      //     import('../categories/categories.module').then(m => m.CategoriesModule),
      // },

      // {
      //   path: 'expenses',
      //   loadChildren: () =>
      //     import('../expenses/expenses.module').then(m => m.ExpensesModule),
      // },

      // {
      //   path: 'shareholders',
      //   loadChildren: () =>
      //     import('../shareholders/shareholders.module').then(m => m.ShareholdersModule),
      // },

      // {
      //   path: 'payments',
      //   loadChildren: () =>
      //     import('../payments/payments.module').then(m => m.PaymentsModule),
      // },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
