import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class EOSService {
  private _eos: any;
  private _eosOptions: any;
  private _network: any;

  constructor(
    private _http: HttpClient
  ) {
    this._init$().subscribe()
  }

  get eos() {
    return this._eos;
  }

  get eosOptions() {
    return this._eosOptions;
  }

  get network() {
    return this._network;
  }

  private _init$() {
    return this._getWalletApi$()
      .do(() => this._setEosOptionsDefault());
  }

  private _getWalletApi$() {
    return this._http.get(`/api/v1/get_wallet_api`)
      .do((res) => this._network = res);
  }

  private _setEosOptionsDefault() {
    this._eosOptions = {
      expireInSeconds: 60,
      keyPrefix: "EOS"
    };
  }
}