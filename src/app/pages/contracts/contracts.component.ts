import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { Subject, Observable } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { ClipboardService } from '../../services/clipboard.service';
import { NotificationsService } from 'angular2-notifications';
import { Contract } from './models/contract';
import { ScatterService } from '../../services/scatter.service';

@Component({
  selector: 'contract-page',
  templateUrl: './contracts.component.html',
  styles: ['./contracts.component.css']
})
export class ContractsPageComponent implements OnInit {
  isLoading: boolean = false;
  searchFC: FormControl;
  destroy$: Subject<boolean>;
  contract: Contract;

  constructor (
    private clipboard: ClipboardService,
    private http: HttpClient,
    private notifications: NotificationsService,
    private route: ActivatedRoute,
    private router: Router,

    private scatterService: ScatterService,
  ) { }

  ngOnInit(): void {
    this.destroy$ = new Subject();
    this.searchFC = new FormControl('');

    this.updateRouterQueryParams$(this.searchFC).subscribe();
    this.doSearch$().subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  copy(data) {
    this.clipboard.copy(JSON.stringify(data));
    this.notifications.success('Copied to the clipboard');
  }

  login() {
    this.isLoading = true;

    this.scatterService.login$()
      .finally(() => this.isLoading = false)
      .subscribe();
  }

  sourceCode$(accountName: string) {
    return this.http.get(`/api/v1/get_source_code/${accountName}`)
      .do((sourceCode: any) => {
        console.log(sourceCode);
        // this.contract = new Contract(contract.account_name, contract.abi)
      })
      .catch((error) => Observable.of(error));
  }

  doSearch$() {
    return this.route
      .queryParamMap
      .takeUntil(this.destroy$)
      .distinctUntilChanged()
      .debounceTime(300)
      .switchMap((queryParams: ParamMap) => {
        const query = queryParams.get('query');

        if (!query)
          return Observable.of(null);

        this.searchFC.setValue(query);
        return this.search$(query);
          // .concatMap(() => this.sourceCode$(query));
      });
  }

  search$(query) {
    return this.http.get(`/api/v1/get_code/${query}`)
      .do((contract: any) => this.contract = new Contract(contract.account_name, contract.abi))
      .catch((error) => {
        this.contract = undefined;
        console.log(error);
        return Observable.of(null);
      });
  }

  updateRouterQueryParams$(formControl: FormControl) {
    return formControl
      .valueChanges
      .takeUntil(this.destroy$)
      .distinctUntilChanged()
      .switchMap(query => this.router.navigate([], { queryParams: { query } }))
  }
}
