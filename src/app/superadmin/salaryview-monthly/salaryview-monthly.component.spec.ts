import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryviewMonthlyComponent } from './salaryview-monthly.component';

describe('SalaryviewMonthlyComponent', () => {
  let component: SalaryviewMonthlyComponent;
  let fixture: ComponentFixture<SalaryviewMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryviewMonthlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryviewMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
