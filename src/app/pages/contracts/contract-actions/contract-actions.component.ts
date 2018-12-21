import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  OnChanges
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject, Observable } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';

import { Contract, IContractField, IContractAction } from '../models/contract';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { NotificationsService } from 'angular2-notifications';
import { ScatterService } from '../../../services/scatter.service';
import { InfoDialog } from '../../../dialogs/info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'contract-actions',
  templateUrl: './contract-actions.component.html',
  styleUrls: ['./contract-actions.component.css']
})
export class ContractActionsComponent implements OnInit, OnDestroy, OnChanges {
  action: IContractAction;
  actionFG: FormGroup;
  destroy$: Subject<boolean>;
  fields: IContractField[] = [];
  filteredActions$: Observable<IContractAction[]>;
  selectionFC: FormControl;

  @Input()
  contract: Contract;

  constructor(
    private _notificationsService: NotificationsService,
    private _scatterService: ScatterService,

    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.selectionFC = new FormControl();
    this.actionFG = new FormGroup({});

    this.filteredActions$ = this._filteredActions$(this.selectionFC);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnChanges() {
    if (this.selectionFC) {
      this.selectionFC.reset();
      this._updateFG(this.actionFG, this.fields, []);
      this.filteredActions$ = this._filteredActions$(this.selectionFC);
    }
  }

  send() {
    if (!this.actionFG.valid) {
      this._notificationsService.error('Invalid form');
      return;
    }

    this._scatterService.getContract$(this.contract.account_name)
      .concatMap(contract => {
        const data = this.actionFG.value;
        Object.keys(this.actionFG.value).forEach((key) => data[key] = isNaN(Number(data[key])) ? data[key] : Number(data[key]));

        this._openDialog('Please check SQRL for the transaction details');

        return Observable.fromPromise(
            this._scatterService.eos.transaction(this.contract.account_name, tr => {
              tr[this.action.name](data, this._scatterService.transactionOptions);
            })
          )
          .finally(() => this.dialog.closeAll())
      })
      .do((data: any = {}) => {
        const blockNum = data.processed ? data.processed.block_num : -1;
        const id = data.processed ? data.processed.id : '';

        this._notificationsService.success('Transaction Success', `Pushed in block ${blockNum}`);
      })
      .catch((error) => {
        const errorMessage = this._getErrorMessage(error);

        this._notificationsService.error(errorMessage);
        return Observable.throw(error);
      }).subscribe();
  }

  select(action: IContractAction) {
    this.action = action;

    const oldFields = this.fields;
    const newFields = this.contract.getFields(action.type);
    this._updateFG(this.actionFG, oldFields, newFields);
  }

  private _updateFG(form: FormGroup, fields: IContractField[] = [], newFields: IContractField[] = []) {
    fields.forEach(control => form.removeControl(control.name));
    newFields.forEach(control => form.addControl(control.name, new FormControl('', [Validators.required])));

    this.fields = newFields;
  }

  private _search$(query: string): Observable<IContractAction[]> {
    return Observable.create((observer) => {
      const queryL = query.toLowerCase();
      const filteredActions: IContractAction[] = !queryL ? this.contract.actions : this.contract.actions.filter((action) => action.name.toLowerCase().indexOf(queryL) > -1);

      observer.next(filteredActions);
      observer.complete();
    });
  }

  private _filteredActions$(form: FormControl): Observable<IContractAction[]> {
    return form.valueChanges
      .takeUntil(this.destroy$)
      .startWith('')
      .distinctUntilChanged()
      .debounceTime(300)
      .switchMap((query: string) => this._search$(query.toLowerCase()));
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
        return 'Transaction Failed  ...';
    }
  }

  private _openDialog(message: string) {
      const dialogConfig = {
          disableClose: true,
          autoFocus: true,
          data: {
              title: 'Attention',
              question: message,
          }
      }
      this.dialog.open(InfoDialog, dialogConfig);
  }
}