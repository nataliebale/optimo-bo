import { ElementRef } from "@angular/core";

export function textIsTruncated(el: HTMLElement) {
	const element = new ElementRef<HTMLElement>(el).nativeElement;
	const disabled = element.scrollWidth <= element.clientWidth;
	return disabled;
}
