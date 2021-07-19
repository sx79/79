import {action, configure, observable} from 'mobx';

configure({enforceActions: "observed"});
export default class UserProfile {

    @observable userProfile = {};

    get getUserProfile() {
        return JSON.parse(JSON.stringify(this.userProfile));
    }


    @action setUserProfile(profile) {
        this.userProfile = profile;
    }

}