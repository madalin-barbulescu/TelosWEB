import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsService } from 'angular2-notifications';
import { MatChipInputEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forkJoin } from "rxjs/observable/forkJoin";
import * as Eos from 'eosjs';
import { InfoDialog } from '../../dialogs/info-dialog/info-dialog.component';
import { ScatterService } from '../../services/scatter.service';
import { IInterrogationDialog } from '../../dialogs/interrogation/interrogation.model';
import { InterrogationDialog } from '../../dialogs/interrogation/interrogation.component';

var ScatterJS;
var ScatterEOS;

@Component({
    selector: 'vote-page',
    templateUrl: './vote.component.html',
    styleUrls: ['./vote.component.css']
})
export class VotePageComponent implements OnInit {
    mainData;
    spinner = false;

    unstaked: any = 0;
    staked: any = 0;
    balance: any = 0;

    identity;
    scatter;
    network;
    connectionOptions = {
        initTimeout: 10000
    };
    eosOptions = {
        expireInSeconds: 60,
        keyPrefix: "EOS"
    }

    proxy = '';
    producers = [];
    selectable = true;
    removable = true;
    addOnBlur = true;

    proposalTimer: any;
    lowerBound = 0;
    upperBound = 0;
    limit = 4;
    openedProposal = -1;
    activeProposalsTab = 'proposalsList';
    proposalsList = [];
    votersWeight = {};
    depositValue: any = 0;
    minValueToDeposit: any = 0;
    wp_env_struct: any;

    voterInfo = {
        votingTokens:["VOTE", "TFVT", "TFBOARD"],
        balances: {
            VOTE: -1,
            TFVT: -1,
            TFBOARD: -1
        }
    }

    readonly PRODUCER_NAME_REGEX = new RegExp(/^[a-z1-5_\-]+$/);
    proposalFormGroup: FormGroup;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(private route: ActivatedRoute,
        protected http: HttpClient,
        public dialog: MatDialog,
        private notifications: NotificationsService,
        private scatterService: ScatterService) { }


    ngOnInit() {
        this.proposalFormGroup = this.newProposalForm();
        ScatterJS = this.scatterService.ScatterJS;
        ScatterEOS = this.scatterService.ScatterEOS;
        this.setScatter();
        this.getWalletAPI();
    }

    private newProposalForm() {
        return new FormGroup({
            receiver: new FormControl('', [
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(this.PRODUCER_NAME_REGEX)
            ]),
            title: new FormControl('', [
                Validators.required,
            ]),
            cycles: new FormControl('', [
                Validators.required,
            ]),
            ipfs_location: new FormControl('', [
                Validators.required,
            ]),
            amount: new FormControl('', [
                Validators.required,
            ]),
        });
    }

    setScatter() {
        if (ScatterJS) {
            this.scatter = ScatterJS.scatter;
            if (this.scatter.identity) {
                this.identity = this.scatter.identity;
                if (this.identity && this.identity.accounts[0] && this.identity.accounts[0].name) {
                    this.getAccount(this.identity.accounts[0].name);
                    this.initEnv();
                }
            }
        }
    }

    getAccount(name) {
        this.spinner = true;
        this.http.get(`/api/v1/get_account/${name}`)
            .subscribe(
                (res: any) => {
                    this.mainData = res;
                    this.getBalance(name);
                    if (res.voter_info) {
                        this.proxy = res.voter_info.proxy;
                        this.producers = res.voter_info.producers;
                    }
                    this.spinner = false;
                },
                (error) => {
                    console.error(error);
                    this.spinner = false;
                });
    }

    initEnv() {
        this.spinner = true;
        let wpenv = this.http.get('/api/v1/get_table_rows/eosio.saving/eosio.saving/wpenv/1')
        let deposits = this.http.get('/api/v1/get_table_rows/eosio.saving/eosio.saving/deposits/10')
        let balances = this.http.get(`/api/v1/get_table_rows/eosio.trail/VOTE/balances/1/${this.identity.accounts[0].name}`)
        let submissions = this.http.post('/api/v1/get_wps_submissions', {limit: this.limit})

        forkJoin([wpenv, deposits, submissions, balances])
            .subscribe(
                (results: any) => {
                    this.spinner = false;
                    const wpenv = results[0].rows;
                    const deposits = results[1].rows;
                    const submissions = results[2];
                    const balances = results[3];

                    if(submissions.length){
                        this.proposalsList = this.proposalsList.concat(submissions);
                        this.upperBound = this.proposalsList[this.proposalsList.length - 1].id;
                        this.lowerBound = this.proposalsList[0].id;
                    }

                    if(balances.rows.length && balances.rows[0].owner === this.identity.accounts[0].name){
                        const tmp = balances.rows[0].tokens.split(" ");
                        this.voterInfo.balances.VOTE = parseInt(tmp[0]);
                    }

                    // this.proposalsList = submissions.map(submission =>
                    //     ({
                    //         ...proposals.find(proposal =>
                    //             ballots.find(ballot => submission.ballot_id === ballot.ballot_id).reference_id === proposal.prop_id),
                    //         ...submission
                    //     }));

                    deposits.map((deposit) => {
                        if (deposit.owner === this.identity.accounts[0].name) {
                            this.depositValue = Number.parseFloat(deposit.escrow.split(' ')[0]);
                        }
                    })
                    this.wp_env_struct = wpenv[0];
                });
    }

    getSubmissionsList(dataToSend: any) {
        return this.http.post('/api/v1/get_wps_submissions', dataToSend)
    }

    showMoreSubmissions() {
        if (this.upperBound) {
            this.getSubmissionsList({ upper_bound: this.upperBound, limit: this.limit}).subscribe(
                (result: any) => {
                    if (!result.length) return this.upperBound = -1;
                    this.proposalsList = this.proposalsList.concat(result);
                    this.upperBound = result[result.length - 1].id;
                }
            );
        }
    }

    openProposal(id: number, i: number) {
        this.openedProposal = this.openedProposal === i ? -1 : i;
        if (!this.proposalsList[i]['no_count']) {
            this.getProposalForSubmission(id, i);
        }
    }

    getProposalForSubmission(id: number, i: number) {
        this.spinner = true;
        this.http.get(`/api/v1/get_table_rows/eosio.trail/eosio.trail/proposals/1/${id}`)
            .subscribe(
                (res: any) => {
                    Object.assign(this.proposalsList[i], res.rows[0])
                    this.http.get(`/api/v1/get_table_rows/eosio.trail/${this.identity.accounts[0].name}/votereceipts/1/${this.proposalsList[i].ballot_id}`)
                        .subscribe(
                            (res: any) => {
                                if(res.rows.length){
                                    let receipt = res.rows[0]
                                    this.votersWeight[receipt.ballot_id] = receipt;
                                    this.votersWeight[receipt.ballot_id].weight = Number(receipt.weight.split(' ')[0]);
                                }
                                this.spinner = false;
                            });
                },
                (error) => {
                    console.error(error);
                    this.spinner = false;
                });
    }

    getBalance(accountId) {
        this.http.get(`/api/v1/get_currency_balance/eosio.token/${accountId}/TLOS`)
            .subscribe(
                (res: any) => {
                    this.unstaked = Number.parseFloat((!res[0]) ? 0 : res[0].split(' ')[0]);
                    if (this.mainData.voter_info && this.mainData.voter_info.staked) {
                        this.staked = Number(this.mainData.voter_info.staked / 10000);
                    }
                    this.balance = (Number(this.unstaked) + Number(this.staked));
                },
                (error) => {
                    console.error(error);
                });
    }

    getWalletAPI() {
        this.http.get(`/api/v1/get_wallet_api`)
            .subscribe(
                (res: any) => {
                    this.network = res;
                },
                (error) => {
                    console.error(error);
                });
    }

    openDialog(message: string) {
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

    errorHandler(error) {
        if (error.message) {
            return error.message;
        } else {
            let parsedError = JSON.parse(error);
            return parsedError.error.details[0].message;
        }
    }

    loginScatter() {
        ScatterJS.plugins(new ScatterEOS());
        this.spinner = true;
        ScatterJS.scatter.connect("TELOS_MONITOR", this.connectionOptions).then(connected => {
            if (!connected) {
                this.spinner = false;
                this.notifications.error('Please make sure SQRL wallet is Open', '');
                return false;
            }
            this.spinner = false;
            this.openDialog('Please choose and identity from SQRL wallet');

            const requiredFields = { accounts: [this.network] };
            if (!this.scatter.identity) {
                this.scatter.getIdentity(requiredFields).then(
                    () => {
                        this.identity = this.scatter.identity;
                        if (this.identity && this.identity.accounts[0] && this.identity.accounts[0].name) {
                            this.getAccount(this.identity.accounts[0].name);
                            this.initEnv();
                        }
                        this.notifications.success('Logged in!', '');
                        this.dialog.closeAll();
                    }
                ).catch((error) => {
                    this.dialog.closeAll();
                    this.notifications.error(this.errorHandler(error));
                })
            } else {
                this.identity = this.scatter.identity;
                if (this.identity && this.identity.accounts[0] && this.identity.accounts[0].name) {
                    this.getAccount(this.identity.accounts[0].name);
                    this.initEnv();
                }
                this.dialog.closeAll();
                this.notifications.success('Logged in!', '');
            }
        });
    }

    logoutScatter() {
        this.scatter.forgetIdentity()
        location.reload();
    }

    // BPS VOTING
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.producers.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    remove(producer): void {
        const index = this.producers.indexOf(producer);
        if (index >= 0) {
            this.producers.splice(index, 1);
        }
    }

    setProxy() {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');
        this.openDialog('Please check SQRL for the transaction details');
        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        eos.contract('eosio', {
            accounts: [this.network]
        }).then(contract => {
            const data = {
                voter: this.identity.accounts[0].name,
                proxy: this.proxy,
                producers: []
            };
            contract.voteproducer(data, transactionOptions).then(trx => {
                this.getAccount(this.identity.accounts[0].name);
                this.dialog.closeAll();
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });
    }

    voteProducers() {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        this.openDialog('Please check SQRL for the transaction details');
        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        eos.contract('eosio', {
            accounts: [this.network]
        }).then(contract => {
            const data = {
                voter: this.identity.accounts[0].name,
                proxy: '',
                producers: this.producers
            };
            contract.voteproducer(data, transactionOptions).then(trx => {
                this.getAccount(this.identity.accounts[0].name);
                this.dialog.closeAll();
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });

    }

    // PROPOSALS VOTING
    submitNewProposal() {
        if (!this.proposalFormGroup.valid) return;

        const data = Object.assign({}, this.proposalFormGroup.value);
        data['proposer'] = this.identity.accounts[0].name;
        data['amount'] = data['amount'].toFixed(4);
        data['amount'] += ' TLOS'

        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        this.openDialog('Please check SQRL for the transaction details');
        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        let feeToTransfer = this.minValueToDeposit - this.depositValue;

        if (feeToTransfer) {
            const transferData = {
                from: this.identity.accounts[0].name,
                to: "eosio.saving",
                quantity: feeToTransfer.toFixed(4) + ' TLOS',
                memo: "''",
            }
            eos.transfer(transferData, transactionOptions).then(trx => {
                this.getBalance(this.identity.accounts[0].name);
                this.depositValue += feeToTransfer;
                this.submitProposal(data, feeToTransfer);
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        } else {
            this.submitProposal(data, feeToTransfer);
        }
    }

    private submitProposal(data: any, fee: number) {
        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        eos.contract('eosio.saving', {
            accounts: [this.network]
        }).then(contract => {
            contract.submit(data, transactionOptions).then(trx => {
                this.depositValue -= fee;
                this.proposalFormGroup.reset();
                this.activeProposalsTab = 'proposalsList';
                this.dialog.closeAll();
                clearTimeout(this.proposalTimer)
                this.spinner = true;
                this.proposalTimer = setTimeout(() => { 
                    this.getSubmissionsList({ lower_bound: this.lowerBound, limit: 1000 }).subscribe(
                        (result: any) => {
                            this.spinner = false;
                            if (!result.length) return;
                            this.proposalsList = result.concat(this.proposalsList);
                            this.lowerBound = this.proposalsList[0].id;
                            this.openedProposal = -1;
                        }
                    );
                }, 5000);
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });
    }

    openCancelSubmissionDialog(sub_id: number, index: number) {
        const data: IInterrogationDialog = {
            title: 'Delete',
            question: `Are you sure you want to delete this Proposal? You will LOSE your deposit.`,
            okButton: 'Delete',
            cancelButton: 'Cancel'
        };

        const dialogRef = this.dialog.open(InterrogationDialog, { data });

        dialogRef.afterClosed()
            .subscribe((isOk: boolean) => {
                if (isOk) this.cancelSubmission(sub_id, index);
            });
    }

    private cancelSubmission(sub_id: number, index: number) {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        this.openDialog('Please check SQRL for the transaction details');

        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        eos.contract('eosio.saving', {
            accounts: [this.network]
        }).then(contract => {
            const data = {
                sub_id: sub_id
            };
            contract.cancelsub(data, transactionOptions).then(trx => {
                this.dialog.closeAll();
                this.proposalsList.splice(index, 1);
                clearTimeout(this.proposalTimer)
                this.spinner = true;
                this.proposalTimer = setTimeout(() => { 
                    this.getSubmissionsList({ lower_bound: this.lowerBound, limit: 1000 }).subscribe(
                        (result: any) => {
                            this.spinner = false;
                            if (!result.length) return;
                            this.proposalsList = result.concat(this.proposalsList);
                            this.lowerBound = this.proposalsList[0].id;
                        }
                    );
                }, 5000);
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });
    }

    openVoting(sub_id: number) {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        this.openDialog('Please check SQRL for the transaction details');

        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        eos.contract('eosio.saving', {
            accounts: [this.network]
        }).then(contract => {
            const data = {
                sub_id: sub_id
            };
            contract.openvoting(data, transactionOptions).then(trx => {
                this.dialog.closeAll();
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });
    }

    getBackDeposit() {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        if (this.depositValue === 0) return;

        this.openDialog('Please check SQRL for the transaction details');

        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        eos.contract('eosio.saving', {
            accounts: [this.network]
        }).then(contract => {
            const data = {
                owner: this.identity.accounts[0].name,
            };
            contract.getdeposit(data, transactionOptions).then(trx => {
                this.getBalance(this.identity.accounts[0].name);
                this.depositValue = 0;
                this.dialog.closeAll();
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });
    }

    onAmountChanged(amount) {
        let fee_amount = amount * this.wp_env_struct.fee_percentage / 100;
        this.minValueToDeposit = fee_amount > this.wp_env_struct.fee_min / 10000 ? fee_amount.toFixed(4) : this.wp_env_struct.fee_min / 10000;
    }

    updateBalace(){
        this.http.get(`/api/v1/get_table_rows/eosio.trail/VOTE/balances/1/${this.identity.accounts[0].name}`).subscribe((result:any)=>{
            if(result.rows.length && result.rows[0].owner === this.identity.accounts[0].name){
                this.voterInfo.balances.VOTE = parseInt(result.rows[0].tokens.split(" ")[0]);
            }else{
                this.voterInfo.balances.VOTE = -1;
            }
        });
    }

    // direction [0 = NO, 1 = YES, 2 = ABSTAIN]
    voteProposal(direction: number, id: number, endTime: number, beginTime: number) {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        if (this.votersWeight[id] && this.votersWeight[id].weight >= this.balance && this.votersWeight[id].directions[0] == direction) return;

        if (beginTime * 1000 >= Date.now() || endTime * 1000 <= Date.now()) return this.notifications.error("Voting window not open");

        this.openDialog('Please check SQRL for the transaction details');

        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);

        const data = {
            ballot_id: id,
            direction: direction,
            voter: this.identity.accounts[0].name
        }

        eos.contract('eosio.trail', {
            accounts: [this.network]
        }).then(contract => {
            const catchErr = (error) =>{
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            }
            
            const wrapup = () => {
                if (this.votersWeight[id]) {
                    this.votersWeight[id].weight = this.balance;
                    this.votersWeight[id].directions[0] = direction;
                    this.votersWeight[id].expiration = endTime;
                } else {
                    this.votersWeight[id] = {
                        ballot_id: id,
                        directions: [direction],
                        weight: this.balance,
                        expiration: endTime
                    }
                }
                this.updateBalace();
                this.dialog.closeAll();
                this.notifications.success('Transaction Success', '');
            }

            const regvoter = () => {
                return eos.transaction('eosio.trail', tr => {
                    tr.regvoter({ voter: this.identity.accounts[0].name, token_symbol: "4,VOTE" }, transactionOptions);
                });
            }

            const mirrorAndCast = () => {
                return eos.transaction('eosio.trail', tr => {
                    tr.mirrorcast({ voter: this.identity.accounts[0].name, token_symbol: "4,TLOS" }, transactionOptions);
                    tr.castvote(data, transactionOptions);
                }).then(wrapup).catch(catchErr);
            }

            if(this.voterInfo.balances.VOTE < 0){
                regvoter().then(mirrorAndCast).catch(catchErr);
            }else{
                mirrorAndCast();
            }
        });
    }

    claimProposal(id: number, endTime: number, status: number, i: number) {
        if (!this.identity) return this.notifications.error('Identity error!!!', '');

        if (endTime * 1000 >= Date.now()) return this.notifications.error("Cycle is still open");

        if (status !== 0) return this.notifications.error("Proposal is closed");

        this.openDialog('Please check SQRL for the transaction details');

        const transactionOptions = { authorization: [`${this.identity.accounts[0].name}@${this.identity.accounts[0].authority}`] };
        const eos = this.scatter.eos(this.network, Eos, this.eosOptions);
        const data = {
            sub_id: id
        }

        eos.contract('eosio.saving', {
            accounts: [this.network]
        }).then(contract => {
            contract.claim(data, transactionOptions).then(trx => {
                this.getBalance(this.identity.accounts[0].name);
                this.getProposalForSubmission(id, i);
                this.dialog.closeAll();
                this.notifications.success('Transaction Success', '');
            }).catch(error => {
                console.error(error);
                this.dialog.closeAll();
                this.notifications.error(this.errorHandler(error));
            });
        }).catch(error => {
            console.error(error);
            this.dialog.closeAll();
            this.notifications.error(this.errorHandler(error));
        });
    }

    convertToBytes(string) {
        let bytes = [];
        for (let i = 0; i < string.length; ++i) {
            bytes.push(string[i].charCodeAt());
        }
        return bytes;
    }

    openDialogMemo(event, data) {
        let result = data;
        let json = false;
        if (data.indexOf('{') >= 0 && data.indexOf('}') >= 0) {
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
    constructor(@Inject(MAT_DIALOG_DATA) public data) { }
}