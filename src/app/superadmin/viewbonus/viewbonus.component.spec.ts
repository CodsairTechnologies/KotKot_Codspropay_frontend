import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewbonusComponent } from './viewbonus.component';

describe('ViewbonusComponent', () => {
  let component: ViewbonusComponent;
  let fixture: ComponentFixture<ViewbonusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewbonusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewbonusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
