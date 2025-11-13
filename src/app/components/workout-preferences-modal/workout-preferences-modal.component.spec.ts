import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkoutPreferencesModalComponent } from './workout-preferences-modal.component';

describe('WorkoutPreferencesModalComponent', () => {
  let component: WorkoutPreferencesModalComponent;
  let fixture: ComponentFixture<WorkoutPreferencesModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WorkoutPreferencesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutPreferencesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
