import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnimatedWireComponent } from './animated-wire.component';

describe('AnimatedWireComponent', () => {
  let component: AnimatedWireComponent;
  let fixture: ComponentFixture<AnimatedWireComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AnimatedWireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedWireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
