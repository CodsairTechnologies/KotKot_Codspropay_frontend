import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkshiftComponent } from './edit-workshift.component';

describe('EditWorkshiftComponent', () => {
  let component: EditWorkshiftComponent;
  let fixture: ComponentFixture<EditWorkshiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWorkshiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditWorkshiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
