import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { IconModule } from '../icon/icon.module';
import { CollapseComponent } from './components/collapse/collapse.component';
import { ContactComponent } from './components/contact/contact.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from './components/language-switcher/language-switcher.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

const COMPONENTS = [
  HeaderComponent,
  CollapseComponent,
  ContactComponent,
  LanguageSwitcher,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    RouterModule,
    IconModule,
    NgSelectModule,
    FormsModule,
    TranslateModule.forChild(),
  ],
  exports: COMPONENTS,
})
export class SharedModule {}
