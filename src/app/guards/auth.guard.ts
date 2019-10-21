import { Injectable , NgZone } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private afAuth: AngularFireAuth, private ngZone: NgZone, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.afAuth.auth.currentUser) {
      // console.log('AuthGuard - not logged in ');
      this.ngZone.run(() => this.router.navigateByUrl('/login', {
        queryParams: {
          return: state.url
        }
      })).then();
      return false;
    } else {
      // console.log('AuthGuard - logged in ' + this.afAuth.auth.currentUser.uid  );
      return true;
    }
  }
}
