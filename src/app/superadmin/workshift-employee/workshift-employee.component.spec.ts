import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshiftEmployeeComponent } from './workshift-employee.component';

describe('WorkshiftEmployeeComponent', () => {
  let component: WorkshiftEmployeeComponent;
  let fixture: ComponentFixture<WorkshiftEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkshiftEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkshiftEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
