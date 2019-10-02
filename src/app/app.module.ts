import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Import firebase-firestore
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { ListComponent } from './views/list/list.component';

import { TooltipModule } from 'ngx-bootstrap/tooltip';

const APP_CONTAINERS = [DefaultLayoutComponent];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DetailComponent } from './views/detail/detail.component';
import { NewspComponent } from './views/newsp/newsp.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

// Custom Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';

import { PopupComponent } from './components/popup/popup.component';
import { Base64img } from './components/popup/base64img';

import { ModalModule } from 'ngx-bootstrap/modal';
import { AddmodulesComponent } from './components/addmodules/addmodules.component';
import { CmodulesComponent } from './components/cmodules/cmodules.component';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'ngx-bootstrap/accordion';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    TooltipModule.forRoot(),
    NgSelectModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    HttpClientModule,
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
    BrowserAnimationsModule,
    CollapseModule.forRoot(),
    AccordionModule.forRoot()
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    ListComponent,
    DetailComponent,
    NewspComponent,
    LoadingIndicatorComponent,
    TruncatePipe,
    HighlightPipe,
    PopupComponent,
    AddmodulesComponent,
    CmodulesComponent
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    Base64img
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
