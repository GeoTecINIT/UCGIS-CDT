import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';

import { ListComponent } from './views/list/list.component';
import { DetailComponent } from './views/detail/detail.component';
import { NewspComponent } from './views/newsp/newsp.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'CDT'
    },
    children: [
      {
        path: 'list',
        data: {
          title: 'List'
        },
        component: ListComponent
      },
      {
        path: 'detail/:name',
        data: {
          title: 'Detail'
        },
        component: DetailComponent
      },
      {
        path: 'newsp/:mode',
        data: {
          title: 'New'
        },
        component: NewspComponent
      },
      {
        path: 'newsp/:mode/:name',
        data: {
          title: 'Duplicate'
        },
        component: NewspComponent
      }
    ]
  },
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
