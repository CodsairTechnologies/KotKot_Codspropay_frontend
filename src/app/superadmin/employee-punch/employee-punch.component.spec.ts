import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePunchComponent } from './employee-punch.component';

describe('EmployeePunchComponent', () => {
  let component: EmployeePunchComponent;
  let fixture: ComponentFixture<EmployeePunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePunchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
