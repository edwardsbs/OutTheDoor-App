/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IdleClockComponent } from './idle-clock.component';

describe('IdleClockComponent', () => {
  let component: IdleClockComponent;
  let fixture: ComponentFixture<IdleClockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdleClockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
