/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TodaySetupComponent } from './today-setup.component';

describe('TodaySetupComponent', () => {
  let component: TodaySetupComponent;
  let fixture: ComponentFixture<TodaySetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodaySetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
