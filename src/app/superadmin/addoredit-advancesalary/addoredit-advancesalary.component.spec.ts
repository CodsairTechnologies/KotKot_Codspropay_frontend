import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddoreditAdvancesalaryComponent } from './addoredit-advancesalary.component';

describe('AddoreditAdvancesalaryComponent', () => {
  let component: AddoreditAdvancesalaryComponent;
  let fixture: ComponentFixture<AddoreditAdvancesalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddoreditAdvancesalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddoreditAdvancesalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
