import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmodulesComponent } from './cmodules.component';

describe('CmodulesComponent', () => {
  let component: CmodulesComponent;
  let fixture: ComponentFixture<CmodulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmodulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmodulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
