import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleviewLoanComponent } from './singleview-loan.component';

describe('SingleviewLoanComponent', () => {
  let component: SingleviewLoanComponent;
  let fixture: ComponentFixture<SingleviewLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleviewLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleviewLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
