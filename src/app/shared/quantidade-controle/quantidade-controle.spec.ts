import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantidadeControle } from './quantidade-controle';

describe('QuantidadeControle', () => {
  let component: QuantidadeControle;
  let fixture: ComponentFixture<QuantidadeControle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantidadeControle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantidadeControle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
