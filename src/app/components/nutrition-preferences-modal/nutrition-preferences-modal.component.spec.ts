import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NutritionPreferencesModalComponent } from './nutrition-preferences-modal.component';

describe('NutritionPreferencesModalComponent', () => {
  let component: NutritionPreferencesModalComponent;
  let fixture: ComponentFixture<NutritionPreferencesModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NutritionPreferencesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionPreferencesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
