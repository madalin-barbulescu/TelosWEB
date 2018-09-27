import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';
import { MainService } from '../../services/mainapp.service';


@Component({
  selector: 'transactions-page',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionPageComponent implements OnInit, OnDestroy{
  transactionId;
  block;
  mainData: any = {};
  moment = moment;
  time;
  trxArr = [];
  dataSource;
  displayedColumns = ['actions'];
  spinner = false;

  constructor(private route: ActivatedRoute, 
              protected http: HttpClient,
              public dialog: MatDialog){}

  getBlockData(transactionId){
      this.spinner = true;
  		this.http.get(`/api/v1/get_transaction/${transactionId}`)
  				 .subscribe(
                      (res: any) => {
                          this.mainData = {...res.transactions[0], ...res.traces[0]};
                          this.time = this.moment(this.mainData.createdAt).format('MMMM Do YYYY, h:mm:ss a');
                          let ELEMENT_DATA: Element[] = [this.mainData];
                          this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
                          this.spinner = false;
                      },
                      (error) => {
                          console.error(error);
                          this.spinner = false;
                      });
  };

  openDialogMemo(event, data){
    let result = data;
    let json = false;
    if (data.indexOf('{') >= 0 && data.indexOf('}') >= 0){
        result = JSON.parse(data);
        json = true;
    }
    this.dialog.open(DialogDataMemo, {
      data: {
         result: result,
         json: json
      }
    });
  }

  ngOnInit() {
    this.block = this.route.params.subscribe(params => {
       this.transactionId = params['id'];
       this.getBlockData(this.transactionId);
    });
  }

  ngOnDestroy() {
    this.block.unsubscribe(); 
  }	
}

@Component({
  selector: 'dialog-data-memo',
  template: `
  <h1 mat-dialog-title>Memo</h1>
  <div mat-dialog-content>
      <ngx-json-viewer [json]="data.result" *ngIf="data.json"></ngx-json-viewer>
      <div *ngIf="!data.json">{{ data.result }}</div>
  </div>
`,
})
export class DialogDataMemo {
  constructor(@Inject(MAT_DIALOG_DATA) public data) {}
}