import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/operator/finally';
import { MatTableDataSource } from '@angular/material';
import { Clipboard } from './clipboard.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'p2p-page',
  templateUrl: './p2p.component.html',
  styleUrls: ['./p2p.component.css']
})
export class P2PageComponent implements OnInit {
  dataSource;
  mainData: any = {};
  spinner = false;
  displayedColumns = ['#', 'Account', 'Organization', 'Url', 'Address', 'Peers'];

  constructor(
    private http: HttpClient,
    private clipboard: Clipboard, 
    private notifications: NotificationsService
  ) {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.spinner = true;
    let producers  = this.http.get(`api/v1/p2p`);

    forkJoin([producers])
      .finally(() => this.spinner = false)
      .subscribe(
        (results: any) => {
          this.mainData = results[0];
          let ELEMENT_DATA = this.mainData;
          this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
          this.dataSource.filterPredicate = (data, filter) => data.name.toLowerCase().indexOf(filter) > -1 ||
            data.url.toLowerCase().indexOf(filter) > -1 ||
            data.organization.toLowerCase().indexOf(filter) > -1 ||
            data.p2pServerAddress.toLowerCase().indexOf(filter) > -1 ||
            data.httpServerAddress.toLowerCase().indexOf(filter) > -1 ||
            data.httpsServerAddress.toLowerCase().indexOf(filter) > -1;
        },
        error => console.log(error)
      )
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  copyPeers(peers: any[]) {
    let value: string = '';
    peers.forEach((peer) => {
      value += `p2p-peer-address = ${peer.p2pServerAddress}\n`;
    });

    this.clipboard.copy(value);
    this.notifications.success(`Copied to the clipboard`);
  }
}







