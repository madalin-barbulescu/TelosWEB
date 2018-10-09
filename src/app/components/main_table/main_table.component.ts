import { Component, ViewChild, OnInit, Inject, Optional, PLATFORM_ID  } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { isPlatformBrowser } from '@angular/common';
import * as moment from 'moment';
import { Socket } from 'ng-socket-io';
import { MainService } from '../../services/mainapp.service';

export interface Element {
  Name: string;
  Price: number;
  high: number;
  low: number;
  Market_cap: string;
  Change: number;
  Vol: string;
  Volume: string;
}
@Component({
  selector: 'main-table',
  templateUrl: './main_table.component.html',
  styleUrls: ['./main_table.component.css']
})
export class MainTableComponent implements OnInit{
  
  curve;
  currMap: any;
  currencyName = 'USD'; //(isPlatformBrowser(this.platformId)) ? this.getCookie('currencyName'): ;
  selected = this.currencyName;

  mainData;
  displayedColumns = ['Number', /*'Hash',*/ 'Transactions', 'Producer', 'Time'];
  displayedColumnsTx = ['Number', 'Name', 'Data'];
  dataSource;
  dataSourceTrx;
  moment = moment;
  trxObj = {
      tx:[],
      bl:[]
  };
  spinner = false;
  offsetPageElems = 10;

  /*@ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;*/

  constructor(protected http: HttpClient,
              @Inject(PLATFORM_ID) private platformId: Object, private socket : Socket, private MainService: MainService) {
  }

  getData() {
      this.spinner = true;
        this.http.get('/api/v1/get_last_blocks/6')
                  .subscribe(
                      (res: any) => {
                        this.mainData = res.sort((a,b)=>b.block_num-a.block_num);
                        this.createDisplayArrays(this.mainData);

                        let ELEMENT_DATA: Element[] = this.trxObj.bl; //this.MainService.sortArray(this.mainData);
                        this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
              
                        let ELEMENT_DATA_TX: Element[] = this.trxObj.tx;
                        this.dataSourceTrx = new MatTableDataSource<Element>(ELEMENT_DATA_TX);

                          this.spinner = false;
                      },
                      (error) => {
                          console.error(error);
                          this.spinner = false;
                      });
  }

  createDisplayArrays(data){
    if (!data){
        return;
    }
    let transactions = [];
    let blocks = [];
    let fullTX = false, fullBL = false;
    let lastBlockNum = this.trxObj.bl[0] ? this.trxObj.bl[0].block_num : 0;

    for(let i = 0; i < data.length && !fullBL; i++){
      const elem = data[i];
      if(elem.block_num <= lastBlockNum) continue;

      for(let j = 0; j < elem.transactions.length && !fullTX; j++){
          const tr = elem.transactions[j];

          for(let k = 0; k < tr.trx.transaction.actions.length && !fullTX; k++){
              const act = tr.trx.transaction.actions[k];

              act.block_num = tr.trx.id;
              act.bn = elem.block_num;
              transactions.push(act);
              fullTX = transactions.length >= this.offsetPageElems;
          }
      }

      blocks.push(elem);
      fullBL = blocks.length >= this.offsetPageElems;
    }
    
    if(!fullTX){
        Array.prototype.push.apply(transactions, this.trxObj.tx.slice(0, this.offsetPageElems - transactions.length));
    }
    if(!fullBL){
        Array.prototype.push.apply(blocks, this.trxObj.bl.slice(0, this.offsetPageElems - blocks.length));
    }

    this.trxObj.tx = transactions;
    this.trxObj.bl = blocks;
  }

  ngOnInit() {
      this.getData();
      this.socket.on('get_last_blocks', (data) => {
            this.mainData = data.sort((a,b)=>b.block_num-a.block_num);
            this.createDisplayArrays(this.mainData);
            
            let ELEMENT_DATA: Element[] = this.trxObj.bl; //this.MainService.sortArray(this.mainData);
            this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
    
            let ELEMENT_DATA_TX: Element[] = this.trxObj.tx;
            this.dataSourceTrx = new MatTableDataSource<Element>(ELEMENT_DATA_TX);
      });
  }
}





















