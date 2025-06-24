import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultMapComponent } from './result-map.component';

describe('ResultMapComponent', () => {
  let component: ResultMapComponent;
  let fixture: ComponentFixture<ResultMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResultMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
