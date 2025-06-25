import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveResultComponent } from './live-result.component';

describe('LiveResultComponent', () => {
  let component: LiveResultComponent;
  let fixture: ComponentFixture<LiveResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveResultComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
