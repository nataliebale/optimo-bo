
export function filterNavsByRoles( navigation: Array<any>, acceptedUserRoles: string ) {
    return navigation.filter( nav => {

        if (nav.children) {
            nav.children = filterNavsByRoles( nav.children, acceptedUserRoles );
        }

        if( !nav.hasOwnProperty('allowedRoles') ) return true;
        return nav.allowedRoles.includes(acceptedUserRoles);
    })
}