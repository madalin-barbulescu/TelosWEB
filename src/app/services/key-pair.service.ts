import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { PrivateKey } from 'eosjs-ecc';
import { fromPromise } from 'rxjs/observable/fromPromise';

type publicKey = string;
type wif = string;

@Injectable()
export class KeyPairService {

  constructor() {}

  generate$(): Observable<[publicKey, wif][]> {
    return fromPromise(PrivateKey.randomKey())
      .map((privateKey: any) => {
        const wif = privateKey.toWif();
        const publicKey = privateKey.toPublic().toString('EOS');
        return [publicKey, wif];
      });
  }
}