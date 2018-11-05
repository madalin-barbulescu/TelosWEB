import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { PrivateKey } from 'eosjs-ecc';
import { Clipboard } from '../../services/clipboard.service';

@Component({
  selector: 'app-key-pair-generation-page',
  templateUrl: './key_pair_generation.component.html',
  styleUrls: ['./key_pair_generation.component.css']
})
export class KeyPairGenerationPageComponent implements OnInit {
  isLoading = false;
  keys: any[];

  constructor(
    protected http: HttpClient,

    private clipboard: Clipboard,
    private notifications: NotificationsService
  ) { }

  ngOnInit() {
    this.generateKeyPair();
  }

  generateKeyPair() {
    const keys = this.keys;
    this.isLoading = true;

    PrivateKey.randomKey().then(privateKey => {
      const wif = privateKey.toWif();
      const publicKey = privateKey.toPublic().toString('TLOS');
      this.keys = [publicKey, wif];
      this.isLoading = false;
      return keys;
    });
  }

  copyKey(key) {
    this.clipboard.copy(key);
    this.notifications.success('Key copied to the clipboard');
  }
}
