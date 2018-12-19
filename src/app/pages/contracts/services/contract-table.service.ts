import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { PageEvent } from "@angular/material";

@Injectable()
export class ContractTableService {

  private _store$: BehaviorSubject<any>;

  constructor() {
    this.init();
  }

  get store$() {
    return this._store$;
  }

  private _initData() {
    return {
      // json: true,
      code: '',
      scope: '',
      table: '',
      table_key: false,
      lowerb: 0,
      upperb: -1,
      limit: 10
    }
  }

  changeScope(scope: string) {
    this.changeValues({scope});
  }

  changeValues(fields: {[key: string]: any}) {
    const storeValue = Object.assign({}, this.store$.value, fields);

    this.store$.next(storeValue);
  }

  changeTable(table: string) {
    const { limit } = this._initData();
    this.changeValues({table, limit});
  }

  changeContract(contractName: string) {
    const initData = this._initData();
    const contractData = {
      code: contractName,
      scope: contractName,
      table: '',
      table_key: false,
    };
    const newData = Object.assign({}, initData, contractData);

    this.reset(newData);
  }

  init() {
    this._store$ = new BehaviorSubject(this._initData());
  }

  pageChanges(data: PageEvent) {
    this.changeValues(this._newPageData(data));
  }

  reset(fields?: {[key: string]: any}) {
    this.changeValues(fields);
  }

  nextPage() {
    const { limit } = this.store$.value;
    const { limit: pageLimit } = this._initData();
    this.changeValues({limit: limit + pageLimit });
  }

  private _newPageData(data: PageEvent) {
    return {
      lowerb: data.pageIndex * data.pageSize,
      upperb: data.pageIndex * data.pageSize + data.pageSize,
      pagination: data
    };
  }
}