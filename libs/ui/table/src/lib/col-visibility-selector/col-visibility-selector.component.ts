import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  Type,
  OnInit,
} from '@angular/core';
import { ColumnData } from '../table.component';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '@optimo/core';

@Component({
  selector: 'app-col-visibility-selector',
  templateUrl: './col-visibility-selector.component.html',
  styleUrls: ['./col-visibility-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColVisibilitySelectorComponent implements OnInit {
  @ViewChild('selectHeader', { static: true })
  selectHeader: ElementRef;

  @Input()
  columns: ColumnData[];

  active: boolean;

  constructor(private storage: StorageService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.restoreColumnsState();
  }

  onVisibleChange(col: ColumnData): void {
    col.hidden = !col.hidden;

    this.saveColumnsState();
  }

  toggleSelect(target?: any): void {
    if (target && this.selectHeader.nativeElement.contains(target)) {
      return;
    }
    this.active = !this.active;
  }

  get visibilityManagableColumns(): ColumnData[] {
    return this.columns?.filter( value => !value?.hideInVisibilitySelector );
  } 

  private restoreColumnsState(): void {
    const savedColumns: Partial<ColumnData>[] = this.storage.get(
      this.componentName
    );

    if (savedColumns) {
      this.columns.forEach((col) => {
        const matchCol = savedColumns.find(
          (c) => c.dataField === col.dataField
        );
        if (matchCol) {
          col.hidden = matchCol.hidden;
        }
      });
    }
  }

  private saveColumnsState(): void {
    this.storage.set(
      this.componentName,
      this.columns.map((c) => ({
        dataField: c.dataField,
        hidden: c.hidden,
      }))
    );
  }

  private get componentName(): string {
    return (this.route.component as Type<any>).name;
  }
}
