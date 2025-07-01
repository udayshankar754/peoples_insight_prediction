import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoutComponent } from './turnout.component';

describe('TurnoutComponent', () => {
  let component: TurnoutComponent;
  let fixture: ComponentFixture<TurnoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
