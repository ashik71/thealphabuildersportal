import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-admin-layout',
    imports: [RouterOutlet, SidebarComponent, HeaderComponent],
    templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {}
