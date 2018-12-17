import { Injectable, EventEmitter, Inject } from '@angular/core';



@Injectable()
export class ScatterService {
    ScatterJS;
    ScatterEOS;

    constructor() {}

    async initScatterService(){
        document.addEventListener('scatterLoaded', (event) => {
            event.stopImmediatePropagation();
        });
        window['scatter'] = undefined;
        this.ScatterJS = !this.ScatterJS ? await import("scatterjs-core") : this.ScatterJS;
        this.ScatterJS = this.ScatterJS.default;

        this.ScatterEOS = !this.ScatterEOS ? await import("scatterjs-plugin-eosjs") : this.ScatterEOS;
        this.ScatterEOS = this.ScatterEOS.default;
    }
}