import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { InvestorListComponent } from './investor-list.component';
import { InvestorService } from '../../services/investor.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('InvestorListComponent', () => {
  let component: InvestorListComponent;
  const service = {
    getAll: jasmine.createSpy().and.returnValue(of([
      { _id: '1', Name: 'Ada', Email: 'ada@example.com', Phone: '1234567', InvestmentAmount: 10, Status: 'active' },
      { _id: '2', Name: 'Grace', Email: 'grace@example.com', Phone: '7654321', InvestmentAmount: 20, Status: 'inactive' },
    ])),
  };

  beforeEach(() => {
    service.getAll.and.returnValue(of([
      { _id: '1', Name: 'Ada', Email: 'ada@example.com', Phone: '1234567', InvestmentAmount: 10, Status: 'active' },
      { _id: '2', Name: 'Grace', Email: 'grace@example.com', Phone: '7654321', InvestmentAmount: 20, Status: 'inactive' },
    ]));
    TestBed.configureTestingModule({
      imports: [InvestorListComponent],
      providers: [
        { provide: InvestorService, useValue: service },
        { provide: MatDialog, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
      ],
    });
    component = TestBed.createComponent(InvestorListComponent).componentInstance;
  });

  it('filters by name, email, and phone', () => {
    component.filter.set('grace');
    expect(component.filteredInvestors().map((investor) => investor.Name)).toEqual(['Grace']);
    component.filter.set('1234567');
    expect(component.filteredInvestors().map((investor) => investor.Name)).toEqual(['Ada']);
  });

  it('exposes an empty list after a successful empty response', () => {
    service.getAll.and.returnValue(of([]));
    component.refresh();
    expect(component.loading()).toBeFalse();
    expect(component.investors()).toEqual([]);
  });

  it('stops loading and exposes an error after a failed response', () => {
    service.getAll.and.returnValue(throwError(() => new Error('failed')));
    component.refresh();
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeTrue();
  });
});
