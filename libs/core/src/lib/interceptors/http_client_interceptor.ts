import { Injectable, OnDestroy, Inject } from '@angular/core';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse,
	HttpParams,
} from '@angular/common/http';
import { first, filter, catchError, switchMap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { CoreLibConfig } from '../core.module';
import { ParameterURIEncoder } from '../helpers/parameter-uri.encoder';
import { ClientService, Service } from '../services/client.service';
import { StorageService } from '../services/storage.service';

@Injectable({
	providedIn: 'root',
})
export class HttpClientInterceptor implements HttpInterceptor, OnDestroy {
	private retry = new Subject<boolean>();



	constructor(
		@Inject('CONFIG') private config: CoreLibConfig,
		private encoder: ParameterURIEncoder,
		private client: ClientService,
		private storage: StorageService
	) {
		this.storage.setCheckingRefreshToken(false);
	}

	intercept(req: HttpRequest<any>, next: HttpHandler) {
		const params = new HttpParams({
			encoder: this.encoder,
			fromString: req.params.toString(),
		});

		const headers: any = { 'x-request-id': this.generateGuid() };
		const accessToken = this.storage.getAccessToken();
		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`;
		}

		const request = req.clone({
			params,
			withCredentials: true,
			setHeaders: headers,
		});
		return this.handle(request, next);
	}

	private handle(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			// retry request if refreshToken
			catchError((err) => {
				console.log('error', err);
				this.checkError(err);
				return this.retry.pipe(
					first(),
					filter((retry) => retry),
					switchMap(() => {
						const accessToken = this.storage.getAccessToken();
						const headers = req.headers
							.delete('Authorization')
							.append('Authorization', `Bearer ${accessToken}`);

						// recursion
						return this.handle(req.clone({ headers }), next);
					})
				);
			})
		);
	}

	private checkError(err: HttpErrorResponse) {
		console.log('I am here and i handled an error: ', err);
		switch (err.status) {
			case 400:
				if (err.url.includes('RefreshAccessToken')) {
					this.storage.deleteAccessToken();
				}
				break;
			case 401:
				setTimeout(() => {
					this.refreshToken();
				});
				return;
		}
		this.retry.next(false);
		throw err;
	}

	private refreshToken() {
		if (this.storage.getCheckingRefreshToken()) {
			return;
		}
		this.storage.setCheckingRefreshToken(true);
		this.client
			.get<any>(
				this.config.refreshAccessTokenEndpoint ?? 'User/RefreshAccessToken',
				{ service: Service.Auth }
			)
			.subscribe(
				(response) => {
					if (response && response.accessToken) {
						this.storage.setAccessToken(response.accessToken);
						this.retry.next(true);
					} else {
						this.storage.deleteAccessToken();
					}
					this.storage.setCheckingRefreshToken(false);
					this.retry.next(false);
				},
				() => {
					this.storage.deleteAccessToken();
					this.storage.setCheckingRefreshToken(false);
					this.retry.next(false);
				}
			);
	}

	private generateGuid(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			// tslint:disable-next-line: no-bitwise
			const r = (Math.random() * 16) | 0;
			// tslint:disable-next-line: no-bitwise
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	ngOnDestroy(): void {
		this.retry.complete();
	}
}
