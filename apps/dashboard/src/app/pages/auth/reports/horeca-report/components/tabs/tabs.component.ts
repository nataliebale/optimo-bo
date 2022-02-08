import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { IReportTab, EReportType } from '../../models';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements OnInit {
  public EReportType = EReportType;
  @Input() reportTabs: IReportTab[];
  @Input() activeTabType: EReportType;
  @Output() reportTabClickHandler = new EventEmitter<IReportTab>();
  constructor() {}

  ngOnInit(): void {}
}
