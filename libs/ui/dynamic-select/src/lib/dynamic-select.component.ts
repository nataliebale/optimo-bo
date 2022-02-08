import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Input,
  forwardRef,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ViewChild,
  ContentChild,
  TemplateRef,
  Directive,
} from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  OperatorFunction,
  of,
  Observable,
} from 'rxjs';
import { takeUntil, switchMap, catchError, map } from 'rxjs/operators';
import { uniqBy, sortBy } from 'lodash-es';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

@Directive({ selector: '[app-dynamic-select-footer-tmp]' })
export class DynamicSelectFooterTemplateDirective {
  constructor(public template: TemplateRef<any>) {}
}
@Directive({ selector: '[app-dynamic-select-option-tmp]' })
export class DynamicSelectOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'app-dynamic-select',
  templateUrl: './dynamic-select.component.html',
  styleUrls: ['./dynamic-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectComponent),
      multi: true,
    },
  ],
})
export class DynamicSelectComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild(NgSelectComponent, { static: true })
  selectComponent: NgSelectComponent;

  @ContentChild(DynamicSelectFooterTemplateDirective, {
    static: true,
    read: TemplateRef,
  })
  footerTemplate: TemplateRef<any>;

  @ContentChild(DynamicSelectOptionTemplateDirective, {
    static: true,
    read: TemplateRef,
  })
  optionTemplate: TemplateRef<any>;

  @Input()
  sortField = 'name';

  @Input()
  sortableByField = true;

  @Input()
  additionalSearchKey: string;

  @Input()
  placeholder: string;

  @Input('value')
  _value: any;

  @Input()
  dataGetter: (state: object) => Observable<any>;

  @Input()
  itemGetterById: (id: number) => Observable<any>;

  @Input()
  showClearButton: boolean;

  @Input()
  multiple: boolean;

  @Input()
  closeOnSelect = true;

  @Input()
  maxSelectedItems: number;

  @Input()
  growable = true;

  @Input()
  showLabel = true;

  @Input()
  openAfterLoad = false;

  @Output()
  change = new EventEmitter<any>();

  @Output()
  add = new EventEmitter<any>();
  @Output()
  remove = new EventEmitter<any>();

  @Output()
  clear = new EventEmitter<void>();

  @Output()
  closed = new EventEmitter<void>();

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.currentState.searchValue = null;
    // this.dataRequester.next();

    if (val) {
      this.onTouched();
      this.onChange(val);
    }
    this.emitChange();
  }

  dataSource: Array<{ id: number; name: string }> = [];
  isLoading = true;
  isDisabled: boolean;

  private waitingForData: boolean;
  private unsubscribe$ = new Subject<void>();
  private dataRequester = new BehaviorSubject<void>(null);
  private currentState = {
    pageSize: 20,
    pageIndex: 0,
    searchValue: null,
    totalCount: 0,
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.listenDataRequester();
    if (this.openAfterLoad) {
      this.selectComponent.open();
    }
  }

  private listenDataRequester(): void {
    this.dataRequester
      .pipe(this.toHttpGetItems, takeUntil(this.unsubscribe$))
      .subscribe(({ data, totalCount }) => {
        this.currentState.totalCount = totalCount;
        this.updateDataSource(data);
      });
  }

  private get toHttpGetItems(): OperatorFunction<void, any> {
    return switchMap(() => {
      return this.dataGetter(this.currentState).pipe(
        catchError(() => {
          return of({ totalCount: 0, data: [] });
        }),
        takeUntil(this.unsubscribe$)
      );
    });
  }

  private requestItemById(id: number): void {
    if (this.itemGetterById) {
      this.itemGetterById(id)
        .pipe(
          map((item) => [item]),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((items) => this.updateDataSource(items));
    }
  }

  private updateDataSource(
    newItems: Array<{ id: number; name: string }> = []
  ): void {
    let data: Array<{ id: number; name: string }>;
    if (this.growable) {
      data = uniqBy([...this.dataSource, ...newItems], 'id');
    } else {
      data = newItems;
    }

    this.dataSource = this.sortableByField
      ? sortBy(data, (i) => i[this.sortField])
      : data;
    // this.dataSource = sortBy(data, (i) => i[this.sortField]);
    console.log(
      'TCL: sendUpdateRequest -> this.categoriesSource',
      this.dataSource
    );
    this.isLoading = false;

    if (this.waitingForData) {
      this.waitingForData = false;
      this.emitChange();
    }
    this.cdr.markForCheck();
  }

  private emitChange(): void {
    let value = this.value;
    if (value) {
      if (this.multiple) {
        value = this.value.map((id) =>
          this.dataSource.find((d) => d.id === id)
        );
      } else {
        value = this.dataSource.find((d) => d.id === this.value);
      }
      if (!value) {
        this.waitingForData = true;
      }
    }
    this.change.emit(value);
  }

  onSearch({ term }): void {
    console.log('TCL: onCategorySearch', term);
    if (this.currentState.searchValue !== term) {
      this.currentState.searchValue = term;
      this.currentState.pageIndex = 0;
      this.isLoading = true;
      this.dataRequester.next();
    }
  }

  onScrollToEnd(): void {
    console.log('TCL: onCategoryScrollToEnd');
    if (this.dataSource.length < this.currentState.totalCount) {
      this.currentState.pageIndex++;
      this.isLoading = true;
      this.dataRequester.next();
    }
  }

  onClear(): void {
    this.clear.emit();
    this.close();
  }

  writeValue(value: any): void {
    console.log('dev => DynamicSelect => writeValue => value:', value);
    this.value = value;
    if (value || value === 0) {
      if (typeof value === 'number' || typeof value === 'string') {
        this.checkOrGetItem(value);
      } else {
        value.forEach((element) => {
          this.checkOrGetItem(element);
        });
      }
    }
    this.cdr.markForCheck();
  }

  private checkOrGetItem(value): void {
    if (!this.dataSource.some((obj) => obj.id === value)) {
      console.log('TCL: value', value);
      this.requestItemById(value);
    }
  }

  onChange = (val: any) => {};
  onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  reload(): void {
    this.value = null;
    this.dataSource = [];
    this.currentState = {
      pageSize: 20,
      pageIndex: 0,
      searchValue: null,
      totalCount: 0,
    };
    console.log('TCL: onTouched -> reload');
    // this.dataRequester.next();
  }

  onOpen(): void {
    this.dataRequester.next();
  }

  close(): void {
    this.selectComponent.close();
  }

  searchFn = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return (
      item[this.sortField]?.toLocaleLowerCase().indexOf(term) > -1 ||
      (this.additionalSearchKey &&
        item[this.additionalSearchKey]?.toLocaleLowerCase().indexOf(term) > -1)
    );
  };

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.dataRequester.complete();
  }
}
