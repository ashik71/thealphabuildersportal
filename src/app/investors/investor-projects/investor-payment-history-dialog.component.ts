import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvestorPayment, InvestorProject } from '../../interfaces/investor.interface';
import { InvestorService } from '../../services/investor.service';

interface PaymentHistoryData {
  investorId: string;
  assignment: InvestorProject;
}

@Component({
  selector: 'app-investor-payment-history-dialog',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DecimalPipe, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './investor-payment-history-dialog.component.html',
})
export class InvestorPaymentHistoryDialogComponent {
  private readonly investorService = inject(InvestorService);
  readonly data = inject<PaymentHistoryData>(MAT_DIALOG_DATA);
  readonly payments = this.investorService.getPayments(this.data.investorId, this.data.assignment._id);
}
