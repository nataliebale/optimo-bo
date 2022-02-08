import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconServiceConfig } from './icon.component';
import { IconPlayComponent } from './play/icon-play.component';
import { IconPieChartComponent } from './pie-chart/icon-pie-chart.component';
import { IconControlComponent } from './control/icon-control.component';
import { IconIntegrationComponent } from './integration/icon-integration.component';
import { IconStatisticsComponent } from './statistics/icon-statistics.component';
import { IconArrowRightComponent } from './arrow-right/icon-arrow-right.component';
import { IconCircleComponent } from './circle/icon-circle.component';
import { IconSquareComponent } from './square/icon-square.component';
import { IconNextStepComponent } from './next-step/icon-next-step.component';
import { IconEnvelopeComponent } from './envelope/icon-envelope.component';
import { IconCalendarComponent } from './calendar/icon-calendar.component';
import { IconFlagComponent } from './flag/icon-flag.component';
import { IconCommentComponent } from './comment/icon-comment.component';
import { IconPhoneComponent } from './phone/icon-phone.component';
import { IconEmailComponent } from './email/icon-email.component';
import { IconBurgerComponent } from './burger/icon-burger.component';
import { IconGelComponent } from './gel/icon-gel.component';
import { IconQuestionComponent } from './question/icon-question.component';
import { IconPhoneLargeComponent } from './phone-large/icon-phone-large.component';
import { IconEmailLargeComponent } from './email-large/icon-email-large.component';
import { IconLocationLargeComponent } from './location-large/icon-location-large.component';
import { IconOkComponent } from './ok/icon-ok.component';
import { IconFooterPhoneComponent } from './footer-phone/icon-footer-phone.component';
import { IconFooterEmailComponent } from './footer-email/icon-footer-email.component';
import { IconFacebookComponent } from './facebook/icon-facebook.component';
import { IconLinkedinComponent } from './linkedin/icon-linkedin.component';
import { IconOpenComponent } from './open/icon-open.component';
import { IconCloseComponent } from './close/icon-close.component';
import { IconDismissComponent } from './dismiss/icon-dismiss.component';
import { IconDownComponent } from './down/icon-down.component';
import { IconSuccessComponent } from './success/icon-success.component';
import { IconArrowTopComponent } from './arrow-top/icon-arrow-top.component';
import { IconInfoComponent } from './info/icon-info.component';
import { IconInterfaceComponent } from './interface/icon-interface.component';
import { IconDevelopmentComponent } from './development/icon-development.component';
import { IconEasyInterfaceComponent } from './easy-interface/icon-easy-interface.component';
import { IconOrdersComponent } from './orders/icon-orders.component';
import { IconFlagGeoComponent } from './flag-geo/icon-flag-geo.component';
import { IconFlagRusComponent } from './flag-rus/icon-flag-rus.component';
import { IconFlagEngComponent } from './flag-eng/icon-flag-eng.component';

const ENTRY_COMPONENTS = [
  IconOkComponent,
  IconGelComponent,
  IconInfoComponent,
  IconFlagComponent,
  IconOpenComponent,
  IconDownComponent,
  IconPlayComponent,
  IconEmailComponent,
  IconPhoneComponent,
  IconCloseComponent,
  IconSquareComponent,
  IconBurgerComponent,
  IconCircleComponent,
  IconCommentComponent,
  IconControlComponent,
  IconDismissComponent,
  IconSuccessComponent,
  IconArrowTopComponent,
  IconCalendarComponent,
  IconEnvelopeComponent,
  IconNextStepComponent,
  IconFacebookComponent,
  IconLinkedinComponent,
  IconQuestionComponent,
  IconInterfaceComponent,
  IconPieChartComponent,
  IconStatisticsComponent,
  IconArrowRightComponent,
  IconPhoneLargeComponent,
  IconEmailLargeComponent,
  IconDevelopmentComponent,
  IconFooterPhoneComponent,
  IconFooterEmailComponent,
  IconIntegrationComponent,
  IconLocationLargeComponent,
  IconEasyInterfaceComponent,
  IconOrdersComponent,
  IconFlagGeoComponent,
  IconFlagRusComponent,
  IconFlagEngComponent,
];

@NgModule({
  declarations: [IconComponent, ...ENTRY_COMPONENTS],
  imports: [CommonModule],
  exports: [IconComponent, ...ENTRY_COMPONENTS],
  entryComponents: ENTRY_COMPONENTS,
  providers: [
    {
      provide: IconServiceConfig,
      useValue: {
        ok: IconOkComponent,
        gel: IconGelComponent,
        info: IconInfoComponent,
        flag: IconFlagComponent,
        open: IconOpenComponent,
        down: IconDownComponent,
        play: IconPlayComponent,
        email: IconEmailComponent,
        close: IconCloseComponent,
        phone: IconPhoneComponent,
        burger: IconBurgerComponent,
        circle: IconCircleComponent,
        square: IconSquareComponent,
        comment: IconCommentComponent,
        dismiss: IconDismissComponent,
        control: IconControlComponent,
        success: IconSuccessComponent,
        calendar: IconCalendarComponent,
        envelope: IconEnvelopeComponent,
        facebook: IconFacebookComponent,
        linkedin: IconLinkedinComponent,
        question: IconQuestionComponent,
        interface: IconInterfaceComponent,
        statistics: IconStatisticsComponent,
        development: IconDevelopmentComponent,
        integration: IconIntegrationComponent,
        orders: IconOrdersComponent,
        'arrow-top': IconArrowTopComponent,
        'next-step': IconNextStepComponent,
        'pie-chart': IconPieChartComponent,
        'arrow-right': IconArrowRightComponent,
        'phone-large': IconPhoneLargeComponent,
        'email-large': IconEmailLargeComponent,
        'footer-phone': IconFooterPhoneComponent,
        'footer-email': IconFooterEmailComponent,
        'location-large': IconLocationLargeComponent,
        'easy-interface': IconEasyInterfaceComponent,
        'flag-geo': IconFlagGeoComponent,
        'flag-rus': IconFlagRusComponent,
        'flag-eng': IconFlagEngComponent,
      },
    },
  ],
})
export class IconModule {}
