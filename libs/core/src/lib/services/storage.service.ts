import { Injectable, OnInit } from '@angular/core';
import decode from 'jwt-decode';
import { CookieService } from '../helpers/cookie.service';
import { LocalStorageService } from '../helpers/local-storage.service';
import { EOptimoProductType } from '../models/EOptimoProductType';

@Injectable({
  providedIn: 'root',
})
export class StorageService implements OnInit {
  EOptimoProductType = EOptimoProductType;

  private _isAdmin: boolean;
  private _hasGlovoIntegration: boolean;

  // get locationId(): number {
  //   // if (!this._locationId) {
  //   //   this._locationId = this.get('locationId') || 1;
  //   // }
  //   // return this._locationId;
  //   // if (this.get('locationId') === null) {
  //   //   this.set('locationId', '1');
  //   // }

  //   // console.log(
  //   //   "StorageService -> getlocationId -> this.get('locationId')",
  //   //   this.get('locationId')
  //   // );

  //   // if (this.get('locationId') === null) {
  //   //   this.set('locationId', '1');
  //   // }
  //   // return this.get('locationId') ? this.get('locationId').toString() : '';

  //   // console.log('dev => storageService => locationId in storage:', this.get('locationId'), 'of type:', typeof this.get('locationId'));
  //   // const locationId = this.get('locationId');
  //   // if (!locationId && locationId !== '') this.set('locationId', 1);
  //   return this.get('locationId')?.toString() || 1;
  // }

  private verifiedOtpToken = '';
  private accessToken: string;
  public get isHorecaMode(): boolean {
    return (
      this.localStorageService.get('ProductType')?.toString() ===
      EOptimoProductType.HORECA.toString()
    );
  }

  public get currentProductType(): EOptimoProductType {
    const ProductType = this.localStorageService.get('ProductType');
    return ProductType ? JSON.parse(ProductType) : EOptimoProductType.Retail;
  }

  public get isGlovoUser(): boolean {
    // glovoUserId = 1
    const tokenPayload = decode(this.accessToken);
    return !!tokenPayload?.integrationProviders?.find(el => el === 1);
  }

  public get isAdmin(): boolean {
    const tokenPayload = decode(this.accessToken);
    console.log('token payload:', tokenPayload);
    return !!tokenPayload?.isAdmin;
  }

  public get integrationProviders(): boolean {
    const tokenPayload = decode(this.accessToken);
    console.log('token payload:', tokenPayload);
    return !!tokenPayload?.integrationProviders;
  }

  constructor(
    private cookieService: CookieService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  set(key: string, value: any, global?: boolean): void {
    this.localStorageService.set(this.generateKey(key, global), value);
  }

  get(key: string, global?: boolean): any {
    return this.localStorageService.get(this.generateKey(key, global));
  }

  remove(key: string, global?: boolean): void {
    this.localStorageService.remove(this.generateKey(key, global));
  }

  private generateKey(key: string, global: boolean): string {
    if (global) {
      return key;
    }
    try {
      const tokenPayload = decode(this.accessToken);
      // console.log('dev => tokenPayload =>', tokenPayload);
      return (
        tokenPayload &&
        tokenPayload.sub &&
        tokenPayload.LegalEntityId &&
        `${tokenPayload.sub}__${tokenPayload.LegalEntityId}__${key}`
      );
    } catch {
      return key;
    }
  }

  getVerifiedOtpToken(): string {
    return this.verifiedOtpToken;
  }

  setVerifiedOtpToken(token: string = '') {
    this.verifiedOtpToken = token;
  }

  getAccessToken(): string {
    this.accessToken = this.cookieService.get('accessToken');
    return this.accessToken;
  }

  deleteAccessToken(): void {
    return this.cookieService.delete('accessToken');
  }

  getCheckingRefreshToken(): boolean {
    return JSON.parse(this.cookieService.get('isCheckingRefreshToken'));
  }

  setCheckingRefreshToken(value: boolean) {
    this.cookieService.set('isCheckingRefreshToken', JSON.stringify(value));
  }

  // setRememberMe(rememberMe: boolean): void {
  //   this.localStorageService.set('rememberMe', rememberMe);
  // }

  // getRememberMe(): boolean {
  //   return this.localStorageService.get('rememberMe');
  // }

  setProductType(token: string): void {
    const tokenPayload = decode(token);
    const ProductType =
      tokenPayload['ProductType'] || EOptimoProductType.Retail;
    this.localStorageService.set('ProductType', ProductType);
  }

  setAccessToken(token: string): void {
    // const rememberMe: boolean = this.getRememberMe();
    // const time = rememberMe && addWeeks(new Date(), 1).getTime();
    this.setProductType(token);
    this.cookieService.set('accessToken', token);
  }

  resetSpace() {
    this.localStorageService.remove('spaceId');
  }
}
