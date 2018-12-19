import { Component, Input, OnInit, OnDestroy, OnChanges } from "@angular/core";
import { FormControl } from "@angular/forms";

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/observable/of';

import { Contract, IContractTable } from "../models/contract";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ContractTableService } from "../services/contract-table.service";
import { MatTableDataSource } from "@angular/material";
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

@Component({
  selector: 'contract-table',
  templateUrl: './contract-table.component.html',
  styleUrls: ['./contract-table.component.css']
})
export class ContratTableComponent implements OnInit, OnDestroy, OnChanges {
  destroy$: Subject<boolean>;
  filteredTables$: Observable<IContractTable[]>;
  selectionFC: FormControl;
  scopeFC: FormControl;
  getTableRowsStore$: BehaviorSubject<any>;
  dataSource: MatTableDataSource<Element>;
  ctStore$ = this.contractTableService.store$;
  table: any;

  @Input()
  contract: Contract;

  constructor(
    private http: HttpClient,
    private contractTableService: ContractTableService
  ) {
    this.table = this.getInitTable();
  }

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.scopeFC = new FormControl()
    this.selectionFC = new FormControl();
    this.dataSource = new MatTableDataSource<Element>([]);

    this.filteredTables$ = this._filteredTables$(this.selectionFC);
    this._updateScope$(this.scopeFC).subscribe();
    this._init$().subscribe();
    this._getTableRows$().subscribe();
  }

  ngOnChanges() {
    if (this.selectionFC) {
      this.destroy$.next(true);

      this.table = this.getInitTable();
      this.dataSource = new MatTableDataSource<Element>([]);
      this.selectionFC.reset();
      this.contractTableService.changeContract(this.contract.account_name);

      this.filteredTables$ = this._filteredTables$(this.selectionFC);
      this._updateScope$(this.scopeFC).subscribe();
      this._init$().subscribe();
      this._getTableRows$().subscribe();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  getInitTable() {
    return {
      name: '',
      more: false,
      columns: []
    };
  }

  select(table: IContractTable) {
    this.contractTableService.changeTable(table.name);
  }

  loadTableRows() {
    this.contractTableService.nextPage();
  }

  private _getTableRows$() {
    return this.contractTableService.store$
      .takeUntil(this.destroy$)
      .switchMap(({code, scope, table, limit, lowerb, upperb, table_key}) => {
        if (!table)
          return Observable.of(null);

        return this.http.get(`/api/v1/get_table_rows_1/${code}/${scope}/${table}/${limit}/${lowerb}/${upperb}/${table_key}`)
          .do((payload: any) => {
            if (this.table.name === table)
              return;

            this.table = this.getInitTable();
            if (payload.rows.length)
              this.table.columns = Object.keys(payload.rows[0]);
          })
          .do((payload: any) => {
            this.table.more = payload.more;

            const rows = payload.rows.map(row => {
              return this.table.columns.reduce((currentRow, col) => {
                currentRow[col] = (typeof row[col] === 'string' || typeof row[col] === 'number' || typeof row[col] === 'boolean') ? row[col] : JSON.stringify(row[col]);
                return currentRow;
              }, {});
            });
            this.dataSource = new MatTableDataSource<Element>(rows);
          })
          .do(() => console.log(this.table))
          .catch(error => {
            console.log(error);
            return Observable.of(null);
          });
      });
  }

  private _init$() {
    return this.contractTableService.store$ 
      .take(1)
      .map(store => {
        return {code: store.code};
      })
      .do((payload) => {
        if (!payload.code && this.contract && this.contract.account_name)
          this.contractTableService.changeContract(this.contract.account_name);
      })
  }

  private _search$(query: string): Observable<IContractTable[]> {
    return Observable.create((observer) => {
      const queryL = query.toLowerCase();
      const filteredTables: IContractTable[] = !queryL ? this.contract.tables : this.contract.tables.filter((table) => table.name.toLowerCase().indexOf(queryL) > -1);

      observer.next(filteredTables);
      observer.complete();
    });
  }

  private _filteredTables$(form: FormControl): Observable<IContractTable[]> {
    return form.valueChanges
      .takeUntil(this.destroy$)
      .startWith('')
      .distinctUntilChanged()
      .debounceTime(300)
      .switchMap((query: string) => this._search$(query.toLowerCase()));
  }

  private _updateScope$(form: FormControl): Observable<IContractTable[]> {
    return form.valueChanges
      .takeUntil(this.destroy$)
      .distinctUntilChanged()
      .debounceTime(300)
      .do((scope: string) => this.contractTableService.changeScope(scope));
  }
}