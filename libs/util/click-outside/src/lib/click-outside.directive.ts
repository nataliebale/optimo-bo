import {
  Directive,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {
  constructor(private _elementRef: ElementRef) {}

  @Output()
  clickOutside = new EventEmitter<any>();

  @HostListener('document:click', ['$event.target']) onMouseEnter(
    targetElement: any
  ) {
    const clickedInside = this._elementRef.nativeElement.contains(
      targetElement
    );
    if (!clickedInside) {
      this.clickOutside.emit(targetElement);
    }
  }
}
