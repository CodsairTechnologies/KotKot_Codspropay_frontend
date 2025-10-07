import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusuploadComponent } from './bonusupload.component';

describe('BonusuploadComponent', () => {
  let component: BonusuploadComponent;
  let fixture: ComponentFixture<BonusuploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonusuploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonusuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
