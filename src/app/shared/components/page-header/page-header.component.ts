import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() showBack = true;

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
