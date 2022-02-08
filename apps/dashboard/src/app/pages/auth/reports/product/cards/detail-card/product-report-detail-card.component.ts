import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';

@Component({
  selector: 'app-product-report-detail-card',
  templateUrl: './product-report-detail-card.component.html',
  styleUrls: ['./product-report-detail-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReportDetailCardComponent {
  getUMOAcronym = getUMOAcronym;

  private _stockItem: any;

  @Input()
  set stockItem(value: any) {
    this._stockItem = value;
    this.imgSrc =
      (this.stockItem && this.stockItem.photoUrl) ||
      'assets/images/no-image.png';
  }

  get stockItem(): any {
    return this._stockItem;
  }

  get suppliersName(): string {
    return (
      this.stockItem &&
      this.stockItem.suppliers &&
      this.stockItem.suppliers.map((s) => s.name).join(', \n')
    );
  }

  get shortSuppliersName(): string {
    let name = this.stockItem && this.stockItem.suppliers[0].name;
    if (this.stockItem && this.stockItem.suppliers.length > 1) {
      name += ', ';
    }
    return name;
  }

  imgSrc = 'assets/images/no-image.png';
}
