import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  ViewChild,
  ViewContainerRef,
  Type,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

export class IconServiceConfig {
  [name: string]: Type<any>;
}
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html'
})
export class IconComponent implements OnChanges {
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
  icon: string;

  private ref: ComponentRef<any>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private config: IconServiceConfig
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.icon) {
      this.create();
    }
  }

  private create(): void {
    if (!this.container) {
      return;
    }
    if (this.ref) {
      this.ref.destroy();
    }
    const componentType: any = this.getComponentType(this.icon);
    const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(
      componentType
    );
    this.ref = this.container.createComponent(factory);
    this.ref.instance.data = this.icon;
    this.ref.instance.fill = this.fill;
  }

  private getComponentType(type: any) {
    const component = this.config[type];
    if (component == null) {
      throw new Error(`icon component not found - ${type}`);
    }
    return component;
  }
}
