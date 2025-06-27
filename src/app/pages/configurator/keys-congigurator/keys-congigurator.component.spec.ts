import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeysCongiguratorComponent } from './keys-congigurator.component';

describe('KeysCongiguratorComponent', () => {
  let component: KeysCongiguratorComponent;
  let fixture: ComponentFixture<KeysCongiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeysCongiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeysCongiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
