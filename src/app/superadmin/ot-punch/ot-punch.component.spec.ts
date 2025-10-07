import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtPunchComponent } from './ot-punch.component';

describe('OtPunchComponent', () => {
  let component: OtPunchComponent;
  let fixture: ComponentFixture<OtPunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtPunchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtPunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
