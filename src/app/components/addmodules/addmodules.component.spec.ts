import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddmodulesComponent } from './addmodules.component';

describe('AddmodulesComponent', () => {
  let component: AddmodulesComponent;
  let fixture: ComponentFixture<AddmodulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddmodulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddmodulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
