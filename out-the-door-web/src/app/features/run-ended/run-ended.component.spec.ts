/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RunEndedComponent } from './run-ended.component';

describe('RunEndedComponent', () => {
  let component: RunEndedComponent;
  let fixture: ComponentFixture<RunEndedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunEndedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunEndedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
