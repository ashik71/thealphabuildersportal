import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
constructor(private auth: AuthService, private router: Router) {}
canActivate(): boolean {
const u = this.auth.current;
console.log("u", u);
if (!u || !u.isAdmin) { this.router.navigate(['/login']); return false; }
return true;
}
}