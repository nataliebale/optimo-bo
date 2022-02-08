import { Component, Input } from '@angular/core';

export interface CollapseData {
  id: string;
  title: string;
  content: string;
}
@Component({
  selector: '[app-collapse]',
  templateUrl: './collapse.component.html',
})
export class CollapseComponent {
  @Input()
  data: CollapseData;

  @Input()
  set triggerOpen(value: boolean) {
    if (value) {
      this.active = value;
    }
  }

  active: boolean;

  constructor() {}

  onToggleItem() {
    this.active = !this.active;
  }
}
