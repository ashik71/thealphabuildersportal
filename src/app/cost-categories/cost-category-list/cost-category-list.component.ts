import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CostCategoryService } from '../../services/cost-category.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CostCategoryFormDialogComponent } from '../cost-category-form-dialog/cost-category-form-dialog.component';
import { CostCategory } from '../../interfaces/expense.interface';

@Component({
  selector: 'app-cost-category-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, PageHeaderComponent],
  templateUrl: './cost-category-list.component.html',
  styleUrl: './cost-category-list.component.scss',
})
export class CostCategoryListComponent {
  private readonly costCategoryService = inject(CostCategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly categories = signal<CostCategory[]>([]);

  constructor() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.costCategoryService.getAll().subscribe({
      next: (list) => {
        this.categories.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  topLevelCategories() {
    return this.categories().filter((c) => !c.ParentCategoryId);
  }

  childrenOf(parentId: string) {
    return this.categories().filter((c) => c.ParentCategoryId === parentId);
  }

  openCreateDialog(parent?: CostCategory) {
    const dialogRef = this.dialog.open(CostCategoryFormDialogComponent, {
      data: { parentId: parent?._id, topLevelCategories: this.topLevelCategories() },
    });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.costCategoryService.create(payload).subscribe(() => {
        this.snackBar.open('Category created', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  openEditDialog(category: CostCategory) {
    const dialogRef = this.dialog.open(CostCategoryFormDialogComponent, {
      data: {
        category,
        hasChildren: this.childrenOf(category._id).length > 0,
        topLevelCategories: this.topLevelCategories(),
      },
    });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.costCategoryService.update(category._id, payload).subscribe(() => {
        this.snackBar.open('Category updated', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  deleteCategory(category: CostCategory) {
    const children = this.childrenOf(category._id);
    if (children.length > 0) {
      this.snackBar.open(
        `Remove its ${children.length} sub-categor${children.length === 1 ? 'y' : 'ies'} first`,
        'Dismiss',
        { duration: 4000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Delete "${category.Name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.costCategoryService.delete(category._id).subscribe(() => {
        this.snackBar.open('Category deleted', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }
}
