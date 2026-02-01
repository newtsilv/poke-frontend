import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionModal } from './evolution-modal';

describe('EvolutionModal', () => {
  let component: EvolutionModal;
  let fixture: ComponentFixture<EvolutionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolutionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
