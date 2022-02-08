import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})

export class RoleService {

    private roleKey: string = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    constructor( private storage: StorageService ) {}


    private decodeAccessToken(): {} {
        const accesToken: string = this.storage.getAccessToken();
        return decode( accesToken );
    }




    public getUserRole(): string {
        const userData: {} = this.decodeAccessToken();
        return userData[ this.roleKey ];
    }


    public isUser( roles: Array<string> ): boolean {
        return ( roles.includes(this.getUserRole()) ) ? true : false;
    }

}