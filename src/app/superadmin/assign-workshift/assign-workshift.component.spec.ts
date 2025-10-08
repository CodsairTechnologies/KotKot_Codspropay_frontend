import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignWorkshiftComponent } from './assign-workshift.component';

describe('AssignWorkshiftComponent', () => {
  let component: AssignWorkshiftComponent;
  let fixture: ComponentFixture<AssignWorkshiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignWorkshiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignWorkshiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
