import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClientService } from '@optimo/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MixpanelService } from '@optimo/mixpanel';

export interface TutorialItem {
  id: number;
  url: string;
  urlEmbed: string;
  src: SafeResourceUrl;
  title: string;
}

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialsComponent {
  tutorials$: Observable<TutorialItem[]> = this.client
    .get<any>('shared/video-tutorials')
    .pipe(
      map((items) => {
        return items.map((item) => ({
          ...item,
          src: this.domSanitizer.bypassSecurityTrustResourceUrl(item.urlEmbed),
        }));
      })
    );

  selectedTutorial: TutorialItem;

  constructor(
    private client: ClientService,
    private domSanitizer: DomSanitizer,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Help');
  }

  onClick(item?: TutorialItem): void {
    this.selectedTutorial = item;
  }

  closeModal(): void {
    this.selectedTutorial = undefined;
  }
}
