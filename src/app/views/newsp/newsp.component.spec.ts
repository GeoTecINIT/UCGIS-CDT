import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewspComponent } from './newsp.component';

describe('NewspComponent', () => {
  let component: NewspComponent;
  let fixture: ComponentFixture<NewspComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewspComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
