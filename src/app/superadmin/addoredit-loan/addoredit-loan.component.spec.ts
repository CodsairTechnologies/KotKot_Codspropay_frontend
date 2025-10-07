import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddoreditLoanComponent } from './addoredit-loan.component';

describe('AddoreditLoanComponent', () => {
  let component: AddoreditLoanComponent;
  let fixture: ComponentFixture<AddoreditLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddoreditLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddoreditLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
