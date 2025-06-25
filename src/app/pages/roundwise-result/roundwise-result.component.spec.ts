import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundwiseResultComponent } from './roundwise-result.component';

describe('RoundwiseResultComponent', () => {
  let component: RoundwiseResultComponent;
  let fixture: ComponentFixture<RoundwiseResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundwiseResultComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundwiseResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
