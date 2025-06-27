import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundwiseAnalysisComponent } from './roundwise-analysis.component';

describe('RoundwiseAnalysisComponent', () => {
  let component: RoundwiseAnalysisComponent;
  let fixture: ComponentFixture<RoundwiseAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundwiseAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundwiseAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
