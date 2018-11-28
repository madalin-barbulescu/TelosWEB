import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';

import { Clipboard } from '../../services/clipboard.service';
import { KeyPairService } from '../../services/key-pair.service';

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
    private keyPairService: KeyPairService,
    private notifications: NotificationsService
  ) { }

  ngOnInit() {
    this.generateKeyPair();
  }

  generateKeyPair() {
    this.isLoading = true;

    this.keyPairService.generate$()
      .finally(() => this.isLoading = false)
      .do((keys) => this.keys = keys)
      .subscribe();
  }

  copyKey(key) {
    this.clipboard.copy(key);
    this.notifications.success('Key copied to the clipboard');
  }
}
