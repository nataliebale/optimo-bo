import { Component, Input, OnInit } from '@angular/core';
import { IViewAttributeItem, ViewAttributeType } from './IViewAttributeItem';

@Component({
  selector: 'optimo-view-attributes',
  templateUrl: './view-attributes.component.html',
  styleUrls: ['./view-attributes.component.scss']
})
export class ViewAttributesComponent implements OnInit {
  @Input()
  items: IViewAttributeItem[] = [];

  @Input()
  columns: number = 3;

  additionalItemsShown = false;

  constructor() { }

  get primaryItems() {
    return this.items?.length <= this.columns ? this.items : this.items?.slice(0, this.columns);
  }

  get additionalItems() {
    return this.hasAdditionalItems ? this.items.slice(this.columns) : [];
  }

  get hasAdditionalItems() {
    return this.items?.length > this.columns;
  }

  toggleAdditionalItems = () => {
    this.additionalItemsShown = !this.additionalItemsShown;
  }

  closeAdditionalItems = () => {
    this.additionalItemsShown = false;
  }

  ngOnInit(): void {
  }
}
