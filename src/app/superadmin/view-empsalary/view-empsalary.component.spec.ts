import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmpsalaryComponent } from './view-empsalary.component';

describe('ViewEmpsalaryComponent', () => {
  let component: ViewEmpsalaryComponent;
  let fixture: ComponentFixture<ViewEmpsalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEmpsalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEmpsalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
