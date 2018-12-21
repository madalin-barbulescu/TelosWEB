import { Component, OnInit, OnDestroy, AfterViewInit, AfterContentInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { FoundationService } from '../services/foundation.service';
import { HttpClient } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'foundation-board-members-page',
  templateUrl: './foundation-board-members.component.html',
  styleUrls: ['./foundation-board-members.component.css']
})
export class FoundationBoardMembersPageComponent implements OnInit, OnDestroy, AfterViewInit {
  count_down = 0;

  displayedColumns = ['#', 'account'];
  dataSource: any = [];

  private _boardMembersSubcription: Subscription;
  private _configSubcription: Subscription;

  constructor(
    private _foundationService: FoundationService,
    private _http: HttpClient
  ) {}

  ngOnInit() {
    this._boardMembersSubcription = this._boardMembers$().subscribe();
    this._configSubcription = this._config$().subscribe();
  }

  ngOnDestroy() {
    if (this._boardMembersSubcription)
      this._boardMembersSubcription.unsubscribe();

    if (this._configSubcription)
      this._configSubcription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this._getBoardMembers$()
      .do((boardMembers: any[]) => this._foundationService.updateBoardMembers(boardMembers))
      .subscribe();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private _boardMembers$() {
    return this._foundationService.getData('boardMembers')
      .do((boardMembers) => this.dataSource = new MatTableDataSource<Element>(boardMembers));
  }

  private _config$() {
    return this._foundationService.getData('config')
      .do((config) => {
        this.count_down = (config.last_board_election_time + config.election_frequency) * 1000;
        this.count_down = this.count_down > Date.now() ? this.count_down : 0;
      })
  }

  private _getBoardMembers$() {

    return this._http.get(`/api/v1/get_table_rows/tf/tf/boardmembers/1000`)
      .map((response: any) => response.rows)
      .catch(() => {
        return Observable.of([{name: 'test1'}, {name: 'test2'}, {name: 'test3'}])
      });
  }
}
