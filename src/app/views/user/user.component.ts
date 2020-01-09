import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {

  public msgSaved: string;
  public msgPwdSaved: string;
  public msgError: string;

  public email: string;
  public affiliation: string;
  public name: string;

  public oldPwd: string;
  public newPwd: string;
  public repNewPwd: string;
  public user: User;

  return = '';

  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private ngZone: NgZone,
    private router: Router
  ) {

    console.log ('user component');
  //  this.ngZone.run(() => this.router.navigateByUrl(this.return)).then();
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.userService.getUserById(user.uid).subscribe(usr => {
          if (usr != null) {
            this.user = usr;
          } else {
            this.userService.addNewUser(user);
          }
        });

        // this.user = user;
        // User is signed in.
        //  console.log('login inside ' + this.afAuth.auth.currentUser.email + ' - route:' + this.return );

      }
    });
  }

  ngOnInit() {
    console.log ('user component');
  }

  savePwd() {

  }

  save() {
    this.userService.updateUserWithId(this.user._id, this.user);
    this.msgSaved = 'Saved!';
  }

  logout() {
    this.afAuth.auth.signOut();
  }

}
