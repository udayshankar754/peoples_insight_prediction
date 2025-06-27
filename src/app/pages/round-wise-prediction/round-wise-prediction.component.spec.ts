import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundWisePredictionComponent } from './round-wise-prediction.component';

describe('RoundWisePredictionComponent', () => {
  let component: RoundWisePredictionComponent;
  let fixture: ComponentFixture<RoundWisePredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundWisePredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundWisePredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
