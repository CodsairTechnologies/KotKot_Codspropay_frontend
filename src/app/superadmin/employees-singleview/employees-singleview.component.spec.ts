import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesSingleviewComponent } from './employees-singleview.component';

describe('EmployeesSingleviewComponent', () => {
  let component: EmployeesSingleviewComponent;
  let fixture: ComponentFixture<EmployeesSingleviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesSingleviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesSingleviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
