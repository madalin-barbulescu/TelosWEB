import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { MainService } from '../../services/mainapp.service';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'account-page',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountPageComponent implements OnInit, OnDestroy{
  accountId;
  block;
  mainData;
  moment = moment;
  time;
  spinner = false;
  balance = 0;
  unstaked;
  actions;
  dataSource;
  displayedColumns = ['actions'];
  code;
  tables = [];
  eosRate;
  subscription;
  displayedColumnsPermissiopn = ['Permission', 'Address', 'Threshold', 'Weight'];
  dataSourcePermission;
  controlledAccount;
  tokensArray;

  constructor(private route: ActivatedRoute, 
              protected http: HttpClient, 
              private MainService: MainService,
              public dialog: MatDialog){}

  getBlockData(accountId){
      this.spinner = true;
  		this.http.get(`/api/v1/get_account/${accountId}`)
  				 .subscribe((res: any) => {
                          this.mainData = res;
                          this.getBalance(accountId);
                          this.time = this.moment(this.mainData.created).format('MMMM Do YYYY, h:mm:ss a');
                          this.getActions(this.mainData.account_name);
                          this.getCode(this.mainData.account_name);

                          let ELEMENT_DATA: Element[] = res.permissions;
                          this.dataSourcePermission = new MatTableDataSource<Element>(ELEMENT_DATA);

                          this.spinner = false;
                      },
                      (error) => {
                          console.error(error);
                          this.spinner = false;
                      });
  };

  getBalance(accountId){
      this.http.get(`/api/v1/get_currency_balance/eosio.token/${accountId}/TLOS`)
           .subscribe((res: any) => {
                          this.unstaked = (!res[0]) ? 0 : Number(res[0].split(' ')[0]); 
                          let staked = 0;
                          if (this.mainData.voter_info && this.mainData.voter_info.staked){
                              staked = this.mainData.voter_info.staked;
                          }
                          this.balance = this.unstaked + staked / 10000;
                          this.eosRate = this.MainService.getEosPrice();
                      },
                      (error) => {
                          console.error(error);
                      });
  }

  getActions(accountName){
      this.http.post(`/api/v1/get_actions/${accountName}`, {upper:new Date(), limit:200, offset:0})
           .subscribe((res: any) => {
						  const tmpF = {};
                          res = res.filter((e)=>{
							if(e && e.receipt && e.receipt.act_digest){
								if(tmpF[e.receipt.act_digest]){
									return false
								}
								tmpF[e.receipt.act_digest] = true;
							}
							return true;
						  });
                          this.actions = res;
                          let ELEMENT_DATA: Element[] = [res];
                          this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
                      },
                      (error) => {
                          console.error(error);
                      });
  }

  getCode(accountName){
      this.http.get(`/api/v1/get_code/${accountName}`)
           .subscribe((res: any) => {
                          delete res.wast;
                          delete res.wasm;
                          this.code = res;
                          this.createTables(this.code, accountName);
                      },
                      (error) => {
                          console.error(error);
                      });
  }

  createTables(data, accountName){
			this.tables = [];
      if (!data.abi || !data.abi.tables){
        return;
      }
      data.abi.tables.forEach(elem => {
          this.http.get(`/api/v1/get_table_rows/${accountName}/${accountName}/${elem.name}/20`)
              .subscribe((res: any) => {
                              this.tables.push({ name: elem.name, data: res });
                          },
                          (error) => {
                              console.error(error);
                          });
      });
  }

  getControlledAccounts(account){
        this.http.get(`/api/v1/get_controlled_accounts/${account}`)
              .subscribe((res: any) => {
                              this.controlledAccount = res;
                          },
                          (error) => {
                              console.error(error);
                          });
  }

//   getAllTokens(account){
//         this.http.post(`/api/v1/get_account_tokens`, { account: account })
//               .subscribe((res: any) => {
//                               this.tokensArray = res;
//                           },
//                           (error) => {
//                               console.error(error);
//                           });      
//   }

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
      this.accountId = params['id'];
      this.getBlockData(this.accountId);
      this.getControlledAccounts(this.accountId);
    //    this.getAllTokens(this.accountId);
    });
    //this.subscription = this.MainService.getEosPrice().subscribe(item => { this.eosRate = item; console.log(item); });
  }

  ngOnDestroy() {
    this.block.unsubscribe(); 
    //this.subscription.unsubscribe();
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














