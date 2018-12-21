import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FoundationService } from '../services/foundation.service';
import { HttpClient } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { IssueCreationDialog } from '../dialogs/issue-creation/issue-creation.component';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'foundation-issues-page',
  templateUrl: './foundation-issues.component.html',
  styleUrls: ['./foundation-issues.component.css']
})
export class FoundationIssuesPageComponent implements OnInit {
  eos: any;
  store$ = this._foundationService.store$;
  WINDOW: any = window;

eosNetwork = {
  blockchain: 'eos',
  host: '',
  port: '',
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
};
eosOptions = {
    broadcast: true,
    sign: true,
    chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
};
protocol = 'https';

  constructor(
    private _dialog: MatDialog,
    private _foundationService: FoundationService,
    private _http: HttpClient,
    private _notifications: NotificationsService
  ) {}

  ngOnInit() {
    this.eos = this.WINDOW.scatter.eos(this.eosNetwork, this.WINDOW.Eos, this.eosOptions, this.protocol);

    this._getIssues$()
      .do((issues: any[]) => this._foundationService.updateIssues(issues))
      .subscribe();
  }

  issueCreation() {
    const dialogRef = this._dialog.open(IssueCreationDialog, {width: '500px'});

    dialogRef.afterClosed()
      .concatMap((data) => this._makeIssue$(data))
      .subscribe();
  }

  private _getIssues$() {
    return this._http.get(`/api/v1/get_table_rows/tf/tf/issues/1000`)
      .map((response: any) => response.rows);
  }

  private _closeIssue$(issue: any) {
    return Observable.fromPromise(this.eos.contract('tf'))
      .concatMap((tf: any) => Observable.fromPromise(tf.closeissue('testaccount5', issue.proposer)))
      .do(() => this._notifications.success(`Issue created`))
      .catch((error) => {
        const errorMessage = this._getEOSerrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      });
  }

  private _makeIssue$({name = '', url = '', transaction = ''} = {}) {
    if (!name || !url) return Observable.of(null);

    return Observable.fromPromise(this.eos.contract('tf'))
      .concatMap((tf: any) => Observable.fromPromise(tf.makeissue('testaccount5', url, name, transaction)))
      .do(() => this._notifications.success(`Issue created`))
      .catch((error) => {
        const errorMessage = this._getEOSerrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      });
  }

  private _getEOSerrorMessage(error): string {
    switch (typeof error) {
      case 'string':
        return error;
      case 'object':
        return error.message;
      default:
        return 'Transaction Failed';
    }
  }
}
