import { OnInit, OnDestroy, Directive } from '@angular/core';

@Directive()
export abstract class BaseReport implements OnInit, OnDestroy {
  constructor() {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}
