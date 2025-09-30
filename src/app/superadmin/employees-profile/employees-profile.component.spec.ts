import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesProfileComponent } from './employees-profile.component';

describe('EmployeesProfileComponent', () => {
  let component: EmployeesProfileComponent;
  let fixture: ComponentFixture<EmployeesProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
