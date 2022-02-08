import { Directive, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[app-header-cell]'
})
export class HeaderCellDirective {
  @Input()
  name: string;
  constructor(public templateRef: TemplateRef<any>) {}
}
