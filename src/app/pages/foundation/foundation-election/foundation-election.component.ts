import { Component, OnInit, OnDestroy } from '@angular/core';
import { FoundationService } from '../services/foundation.service';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { NominateDialog } from '../dialogs/nominate/nominate.component';
import { NotificationsService } from 'angular2-notifications';
import { ScatterService } from '../../../services/scatter.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { CandidateAddDialog } from '../dialogs/candidate-add/candidate-add.component';
import { InterrogationDialog } from '../../../dialogs/interrogation/interrogation.component';
import { IInterrogationDialog } from '../../../dialogs/interrogation/interrogation.model';

@Component({
  selector: 'foundation-election-page',
  templateUrl: './foundation-election.component.html',
  styleUrls: ['./foundation-election.component.css']
})
export class FoundationElectionPageComponent implements OnInit, OnDestroy {
  election: any;
  electionState: any;
  displayedColumns = ['#', 'nominated_account', 'votes', 'info_link', 'action' ];
  dataSource: any = new MatTableDataSource<Element>([]);
  store$ = this._foundationService.store$;
  WINDOW: any = window;

  private _electionListSubcription: Subscription;
  private _electionStoreSubcription: Subscription;
  private _configSubcription: Subscription;

  constructor(
    private _dialog: MatDialog,
    private _foundationService: FoundationService,
    private _http: HttpClient,
    private _notifications: NotificationsService,

    public scatterService: ScatterService
  ) {}

  ngOnInit() {
    this.electionState = {
      begin_time: 0,
      count_down: 0,
      end_time: 0,
      timeframe: 0,
    };

    this._electionStoreSubcription = this._electionStore$().subscribe();
    this._electionListSubcription = this._electionList$().subscribe();
    this._configSubcription = this._config$().subscribe();

    let observables = [
      this.getBalance$(),
      this._getNominees$()
    ];

    forkJoin(observables).subscribe();
  }

  ngOnDestroy() {
    if (this._electionListSubcription)
      this._electionListSubcription.unsubscribe();

    if (this._electionStoreSubcription)
      this._electionStoreSubcription.unsubscribe();

    if (this._configSubcription)
    this._configSubcription.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  nominate() {
    const dialogRef = this._dialog.open(NominateDialog, {width: '500px'});

    dialogRef.afterClosed()
      .concatMap(({ nominee }) => {
        return this._nominate$(nominee)
          .concatMap(() => this._refreshElectionList$())
      })
      .catch((error) => {
        const errorMessage = this._getErrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      })
      .subscribe();
  }

  getBalance$() {
    return this._http.get(`/api/v1/get_table_rows/eosio.trail/TFVT/balances/1/${this.scatterService.account.name}`)
      .map((balance: any) => {
        if(balance.rows.length && balance.rows[0].owner === this.scatterService.account.name)
          return parseFloat(balance.rows[0].tokens);
        return 0;
      })
      .do((balance) => this._foundationService.updateBalance(balance));
  }

  vote(candidate) {
    this._vote$(candidate)
    .catch((error) => {
      const errorMessage = this._getErrorMessage(error);

      this._notifications.error(errorMessage);
      return Observable.throw(error);
    })
    .concatMap(() => this._refreshElectionList$())
    .subscribe();
  }

  addCand(nominee) {
    const dialogRef = this._dialog.open(CandidateAddDialog, {width: '500px'});

    dialogRef.afterClosed()
      .concatMap(({ info_link }) => {
        return this._addCand$(nominee, info_link)
          .concatMap(() => this._refreshElectionList$())
      })
      .catch((error) => {
        const errorMessage = this._getErrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      })
      .subscribe();
  }

  removeCand(candidate) {
    const data: IInterrogationDialog = {
      cancelButton: 'Cancel',
      okButton: 'Drop',
      question: 'Are you sure you want to drop from the election?',
      title: 'Drop from election'
    };
    const dialogRef = this._dialog.open(InterrogationDialog, {width: '500px', data });

    dialogRef.afterClosed()
      .concatMap((isOk: boolean) => {
        if (!isOk)
          return Observable.of(null);

        return this._removeCand$(candidate)
          .concatMap(() => this._refreshElectionList$())
      })
      .catch((error) => {
        const errorMessage = this._getErrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      })
      .subscribe();
  }

  endElection() {
    if (!this.scatterService.identity || !this.scatterService.account) return  Observable.throw('There is no identity! Please login first!');

    this._endElection$()
      .concatMap(() => this._refreshElectionList$())
      .catch((error) => {
        const errorMessage = this._getErrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      }).subscribe(); 
  }

  private _endElection$() {
    return this.scatterService.makeTransaction$('tf', tr => {
      const data = {
        holder: this.scatterService.account.name,
      };

      tr.endelection(data, this.scatterService.transactionOptions);
    })
    .do(() => this._notifications.success(`You have ended the election!`))
  }

  private _vote$(candidate: any) {
    if (!candidate) return Observable.throw('There is no candidate to vote!');

    if (!this.scatterService.identity || !this.scatterService.account) return  Observable.throw('There is no identity! Please login first!');

    return this._foundationService.store$
      .take(1)
      .concatMap(store => {
        return this.scatterService.makeTransaction$('eosio.trail', tr => {
          const data = {
            voter: this.scatterService.account.name,
            ballot_id: store.config.open_election_id,
            direction: candidate.index
          };

          tr.castvote(data, this.scatterService.transactionOptions);
        })
        .do(() => this._notifications.success(`You have voted for \'${candidate.member}\' with ${store.balance} TFVT`));
      });
  }

  private _addCand$(nominee, info_link) {
    if (!nominee) return Observable.throw('There is no nominee to add!');

    if (!this.scatterService.identity || !this.scatterService.account) return  Observable.throw('There is no identity! Please login first!');

    return this._foundationService.store$
      .take(1)
      .concatMap(store => {
        return this.scatterService.makeTransaction$('tf', tr => {
          const data = {
            nominee: this.scatterService.account.name,
            info_link
          };
  
          tr.addcand(data, this.scatterService.transactionOptions);
        })
        .do(() => this._notifications.success(`You have joined the election`));
      });
  }

  private _removeCand$(candidate) {
    if (!candidate) return Observable.throw('There is no candidate to remove!');

    if (!this.scatterService.identity || !this.scatterService.account) return  Observable.throw('There is no identity! Please login first!');

    return this.scatterService.makeTransaction$('tf', tr => {
      const data = {
        candidate: this.scatterService.account.name
      };

      tr.removecand(data, this.scatterService.transactionOptions);
    })
    .do(() => this._notifications.success(`You have dropped from the election`));
  }

  private _refreshElectionList$() {
    return forkJoin([
      this._foundationService.store$
        .take(1)
        .concatMap((store: any) => this._getLeaderboard$(store.config)),
      this._getNominees$()
    ]);
  }

  private _electionList$() {
    return this._foundationService.getData('electionList')
      .do((electionList) => this.dataSource = new MatTableDataSource<Element>(electionList))
  }

  private _electionStore$() {
    return this._foundationService.getData('election')
      .do((election) => {
        this.election = election;

        this.electionState.timeframe = 0;
        this.electionState.end_time = election.end_time * 1000;
        this.electionState.begin_time = election.begin_time * 1000;
        this.electionState.count_down_message = `No election`;
        this.electionState.account_type = 'Nominee';

        if (election.status === 0) {
          if (Date.now() < this.electionState.end_time) {
            this.electionState.timeframe = 2;
            this.electionState.count_down = this.electionState.end_time;
            this.electionState.count_down_message = `Voting in progress`;
            this.electionState.account_type = 'Candidate';
          } else {
            this.electionState.count_down_message = `Election period is over`;
            this.electionState.account_type = 'Candidate';
          }

          if (Date.now() < this.electionState.begin_time) {
            this.electionState.timeframe = 1;
            this.electionState.count_down = this.electionState.begin_time;
            this.electionState.count_down_message = `Candidates can register`;
            this.electionState.account_type = 'Account';
          }
        }
      });
  }

  private _config$() {
    return this._foundationService.getData('config')
      .concatMap((config) => this._getLeaderboard$(config));
  }

  private _getNominees$() {
    return this._http.get(`/api/v1/get_table_rows/tf/tf/nominees/1000`)
      .map((res: any) => {
        if(res && res.rows)
          return res.rows;
        return [];
      })
      .do((nominees) => this._foundationService.updateNominees(nominees))
      .catch((error) => {
        const errorMessage = this._getErrorMessage(error);

        this._notifications.error(errorMessage);
        return Observable.throw(error);
      });
  }

  private _nominate$(nominee: string) {
    if (!nominee) return Observable.throw('There is no nominee to nominate!');

    if (!this.scatterService.identity || !this.scatterService.account) return  Observable.throw('There is no identity! Please login first!');

    return this.scatterService.makeTransaction$('tf', tr => {
        const data = {
          nominee,
          nominator: this.scatterService.account.name
        };

        tr.nominate(data,this.scatterService.transactionOptions);
      })
      .do(() => this._notifications.success(`You have nominated \'${nominee}\' to become a Telos Foundation Board Member`));
  }

  private _getLeaderboard$(config) {
    return this._http.get(`/api/v1/get_table_rows/eosio.trail/eosio.trail/leaderboards/1/${config.leaderboard_id}`)
      .map((res: any) => {
        if(res && res.rows && res.rows.length && res.rows[0].board_id === config.leaderboard_id)
          return res.rows[0];
        return {};
      })
      .do((election) => this._foundationService.updateElection(election))
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
}
