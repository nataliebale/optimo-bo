import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { FAQ } from './list/faq.model';
import { Observable } from 'rxjs';
import { ClientService } from '@optimo/core';
import { map } from 'rxjs/operators';

@Injectable()
export class FaqResolver implements Resolve<FAQ[]> {
  constructor(private client: ClientService) {}

  resolve(route: ActivatedRouteSnapshot): FAQ[] | Observable<FAQ[]> {
    const { categorySlug } = route.params;

    if (!categorySlug) {
      return [];
    }
    return this.getItems(categorySlug);
  }

  private getItems(categorySlug: string): Observable<FAQ[]> {
    return this.client.get<FAQ[]>(`FAQCategories/${categorySlug}/faqs`).pipe(
      map((items: FAQ[]) => {
        return items && items.sort((a, b) => a.sortIndex - b.sortIndex);
      })
    );
  }
}
