import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    standalone: false
})
export class LoginComponent {
  email = '';
  password = '';
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit() {
    this.auth
      .login(this.email, this.password)
      .pipe(take(1))
      .subscribe((response) => {
        if (response.isAdmin) this.router.navigate(['/admin']);
        else this.router.navigate(['/']);
      });
  }
}
