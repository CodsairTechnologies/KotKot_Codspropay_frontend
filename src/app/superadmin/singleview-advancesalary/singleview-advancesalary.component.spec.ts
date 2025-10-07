import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleviewAdvancesalaryComponent } from './singleview-advancesalary.component';

describe('SingleviewAdvancesalaryComponent', () => {
  let component: SingleviewAdvancesalaryComponent;
  let fixture: ComponentFixture<SingleviewAdvancesalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleviewAdvancesalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleviewAdvancesalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
