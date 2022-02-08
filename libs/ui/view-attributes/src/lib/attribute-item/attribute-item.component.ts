import { Component, Input, OnInit } from '@angular/core';
import { IViewAttributeItem, ViewAttributeType } from '../IViewAttributeItem';

@Component({
  selector: 'optimo-attribute-item',
  templateUrl: './attribute-item.component.html',
  styleUrls: ['./attribute-item.component.scss']
})
export class AttributeItemComponent implements OnInit {
  @Input()
  item: IViewAttributeItem;

  constructor() { }

  ngOnInit(): void {
  }

  get attributeTypes() {
    return ViewAttributeType;
  }
}
