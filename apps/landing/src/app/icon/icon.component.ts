import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  ViewChild,
  ViewContainerRef,
  Type,
  AfterViewInit
} from '@angular/core';

export class IconServiceConfig {
  [name: string]: Type<any>;
}
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html'
})
export class IconComponent implements AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  private _fill: string;

  @Input()
  set fill(value: string) {
    this._fill = value;
    if (this.ref) {
      this.ref.instance.fill = value;
    }
  }

  get fill(): string {
    return this._fill;
  }

  private _icon: string;

  @Input()
  set icon(value: string) {
    this._icon = value;
    this.create();
  }

  get icon(): string {
    return this._icon;
  }

  private _data: any;

  @Input()
  set data(value: any) {
    this._data = value;
    if (this.ref) {
      this.ref.instance.data = value;
    }
  }

  get data(): any {
    return this._data;
  }

  private ref: ComponentRef<any>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private config: IconServiceConfig
  ) {}

  ngAfterViewInit(): void {
    this.create();
  }

  private create(): void {
    if (this.ref) {
      this.ref.destroy();
    }
    if (!this.icon || !this.container) {
      return;
    }
    const componentType: any = this.getComponentType(this.icon);
    const factory: ComponentFactory<
      any
    > = this.resolver.resolveComponentFactory(componentType);
    this.ref = this.container.createComponent(factory);
    this.ref.instance.data = this.icon;
    this.ref.instance.fill = this.fill;
    this.ref.instance.data = this.data;
  }

  private getComponentType(type: any) {
    const component = this.config[type];
    if (component == null) {
      throw new Error(`icon component not found - ${type}`);
    }
    return component;
  }
}
