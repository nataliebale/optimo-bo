import { Directive, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[app-cell]'
})
export class CellDirective {
  @Input()
  name: string;
  constructor(public templateRef: TemplateRef<any>) {}
}
