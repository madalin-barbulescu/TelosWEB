
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { EOSService } from "./eos.service";
import { NotificationsService } from "angular2-notifications";
import { MatDialog } from "@angular/material";
import { InfoDialog } from "../dialogs/info-dialog/info-dialog.component";

import * as Eos from 'eosjs';

var ScatterJS;
var ScatterEOS;

@Injectable()
export class ScatterService {
  static readonly APP_NAME: string = 'TELOS_MONITOR';
  private _connectionOptions: any;
  private _eos: any;
  private _scatter: any;

  constructor(
    private _eosService: EOSService,
    private _notifications: NotificationsService,
    public dialog: MatDialog,
  ) {
    this._setConnectionOptionsDefault();
    try {
      this.initScatterService();
    } catch (error) {
      console.error(error);  
    }
  }

  async initScatterService() {
    document.addEventListener('scatterLoaded', (event) => {
        event.stopImmediatePropagation();
    });
    window['scatter'] = undefined;
    ScatterJS = !ScatterJS ? await import("scatterjs-core") : ScatterJS;
    ScatterJS = ScatterJS.default;

    ScatterEOS = !ScatterEOS ? await import("scatterjs-plugin-eosjs") : ScatterEOS;
    ScatterEOS = ScatterEOS.default;

    this.initScatter();
  }

  get connectionOptions() {
    return this._connectionOptions;
  }

  get scatter() {
    return this._scatter || {};
  }

  get identity() {
    return this.scatter.identity;
  }

  get eos() {
    console.log(this.eosNetwork, Eos, this._eosService.eosOptions);
    return this.scatter.eos(this.eosNetwork, Eos, this._eosService.eosOptions);
  }

  get eosNetwork() {
    return this._eosService.network;
  }

  get transactionOptions() {
    return { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
  }

  login$() {
    return this.connectScatter$()
      .concatMap(connected => {
        if (!connected) return Observable.throw({message: 'Please make sure SQRL wallet is Open'});

        return this.getIdentity$({ accounts: [this.eosNetwork] })
      })
      .do(() => this._notifications.success('Logged in!'))
      .catch((error) => {
        console.log(error);
        const errorMessage = this._getErrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(null);
      });
  }

  logout$() {
    return Observable.fromPromise(this.scatter.forgetIdentity());
  }

  getIdentity$(options) {
    if (this.identity) return Observable.of(null);

    this._openDialog('Please choose an identity from SQRL wallet');

    return Observable.fromPromise(this.scatter.getIdentity(options))
      .finally(() => this.dialog.closeAll());
  }

  connectScatter$() {
    return Observable.fromPromise(this.scatter.connect(ScatterService.APP_NAME, this.connectionOptions));
  }

  initScatter() {
    ScatterJS.plugins(new ScatterEOS());
    this._scatter = ScatterJS.scatter;
  }

  private _getErrorMessage(error) {
    try {
      error = JSON.parse(error);
    } catch(e) { }

    switch (typeof error) {
      case 'string':
        return error;
      case 'object':
        if(error.error && error.error.details && error.error.details.length){
          return error.error.details[0].message || error.error.what;
        }
        return error.message || 'Error... Check the console';
      default:
        return 'Error transactions ...';
    }
  }

  private _openDialog(message: string) {
      const dialogConfig = {
          disableClose: true,
          autoFocus: true,
          data: {
              title: 'Attention',
              question: message,
          }
      }
      this.dialog.open(InfoDialog, dialogConfig);
  }

  private _setConnectionOptionsDefault() {
    this._connectionOptions = {
      initTimeout: 10000
    };
  }
}