import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  mapOfPackageTypes,
  PackageType,
} from '../../request/form/package-type.enum';

@Component({
  selector: 'app-packages-tabs',
  templateUrl: './packages-tabs.component.html',
})
export class PackagesTabsComponent implements OnInit {
  @Output()
  changeTab = new EventEmitter<PackageType>();
  mapOfPackageTypes = mapOfPackageTypes;
  activeTab: PackageType;

  ngOnInit(): void {
    this.onChangeTab(PackageType.Basic);
  }

  onChangeTab(type: PackageType): void {
    this.activeTab = type;
    this.changeTab.emit(type);
  }
}
