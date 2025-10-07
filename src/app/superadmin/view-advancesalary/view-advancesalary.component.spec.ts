import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdvancesalaryComponent } from './view-advancesalary.component';

describe('ViewAdvancesalaryComponent', () => {
  let component: ViewAdvancesalaryComponent;
  let fixture: ComponentFixture<ViewAdvancesalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAdvancesalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAdvancesalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
