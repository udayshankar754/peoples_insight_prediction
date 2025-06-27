import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiRoundWiseResultComponent } from './bi-round-wise-result.component';

describe('BiRoundWiseResultComponent', () => {
  let component: BiRoundWiseResultComponent;
  let fixture: ComponentFixture<BiRoundWiseResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiRoundWiseResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiRoundWiseResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
