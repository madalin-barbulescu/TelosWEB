import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import * as ecc from 'eosjs-ecc';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/distinctUntilChanged';
import { MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material';
import { InterrogationDialog } from '../../../dialogs/interrogation/interrogation.component';
import { IInterrogationDialog } from '../../../dialogs/interrogation/interrogation.model';

@Component({
  selector: 'app-p2p-management',
  templateUrl: './p2p-management.component.html',
  styleUrls: ['./p2p-management.component.css']
})
export class P2PageManagementComponent implements OnInit {
  managementFGroup: FormGroup;
  isLoading: boolean = false;
  displayedColumns = ['#', 'Account', 'Organization', 'Url', 'Actions'];
  dataSource: any = [];
  mainData: any = {};
  hide = true;
  headerCheckbox: any = {};

  private checksSubscription: Subscription;
  private headerCheckboxSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private notifications: NotificationsService
  ) {
    ecc.config.address_prefix = 'TLOS';
  }

  ngOnInit() {
    this.getData();
    this.managementFGroup = this.newForm();
    this.checksSubscription = this.watchChecksChanges(this.managementFGroup).subscribe();
    this.headerCheckboxSubscription = this.watchHeaderCheckboxChanges(this.managementFGroup).subscribe();
  }

  ngOnDestroy() {
    if (this.checksSubscription)
      this.checksSubscription.unsubscribe();

    if (this.headerCheckboxSubscription)
      this.headerCheckboxSubscription.unsubscribe();
  }

  getData() {
    this.isLoading = true;

    this.http.get(`api/v1/p2p`)
      .do((peers: any[]) => {
        const checks = this.getChecksFormControl(peers);

        if (this.managementFGroup.get('checks'))
          this.managementFGroup.removeControl('checks')

        this.managementFGroup.setControl('checks', checks);
      })
      .finally(() => this.isLoading = false)
      .subscribe(
        (peers: any) => {
          this.mainData = peers;
          let ELEMENT_DATA = this.mainData;
          this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
          this.dataSource.filterPredicate = (data, filter) => data.name.toLowerCase().indexOf(filter) > -1 ||
            data.url.toLowerCase().indexOf(filter) > -1;
        },
        error => console.log(error)
      )
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deletePeers(peers: any[]) {
    const list = peers.reduce((list, peer) => {
      list.push(peer.name);
      return list;
    }, []);

    let signature;
    try {
      signature = ecc.sign(JSON.stringify(list), this.managementFGroup.value.privateKey);
    } catch(error) {
      this.notifications.error('Error', error.message);
      return;
    }

    this.postSign({ signature, list });
  }

  openDeleteDialog(peers: any[]) {
    if (!peers.length) return;

    const data: IInterrogationDialog = {
      title: 'Delete',
      question: `Are you sure you want to delete ${this.getPeersToString(peers)}?`,
      okButton: 'Delete',
      cancelButton: 'Cancel'
    };

    const dialogRef = this.dialog.open(InterrogationDialog, {data});

    dialogRef.afterClosed()
      .subscribe((isOk: boolean) => {
        if (isOk) this.deletePeers(peers);
      });
  }

  postSign(data) {
    this.isLoading = true;

    this.http.post("/admin/v1/p2p/delete", data)
      .finally(() => this.isLoading = false)
      .subscribe(
        () => {
          this.notifications.success("Deleted!");
          this.getData();
        },
        (error: any) => {
          console.log(error);
          this.notifications.error(error.message);
        }
      );
  }

  send() {
    const peers = this.dataSource.data;
    const checkValues = this.managementFGroup.get('checks').value;

    this.openDeleteDialog(peers.filter((peer) => checkValues[peer.name]));
  }

  watchChecksChanges(form: FormGroup) {
    return form.valueChanges
      .do((value) => {
        if (!value.checks) return;

        const peers = Object.keys(value.checks);
        let count: number = peers.filter((peer) => value.checks[peer]).length;

        if (!count || count < 1) {
          this.headerCheckbox.checked = false;
          this.headerCheckbox.indeterminate = false;
        }
        else if (count === peers.length) {
          this.headerCheckbox.checked = true;
          this.headerCheckbox.indeterminate = false;
        } else if (count >=1) {
          this.headerCheckbox.checked = false;
          this.headerCheckbox.indeterminate = true;
        }
      });
  }

  watchHeaderCheckboxChanges(form: FormGroup) {
    return form.get('headerCheckbox')
      .valueChanges
      .do((data) => {
        const peers = this.managementFGroup.value.checks;
        let checks = {};
        const value = data;
    
        Object.keys(peers)
          .forEach((peer) => checks[peer] = value);
        
        this.managementFGroup.patchValue({checks});
      });
  }

  private newForm() {
    return new FormGroup({
      privateKey: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/)
      ]),
      headerCheckbox: new FormControl(false),
      checks: this.getChecksFormControl([]),
    });
  }

  private getPeersToString(peers: any[]) {
    return peers.reduce((val, peer, i) => {
      if (i === 0)
        val = peer.name;
      else
        val += `, ${peer.name}`;

      return val;
    }, '');
  }

  private getChecksFormControl(peers: any[]) {
    const checks = new FormGroup({}, this.hasAtLeastOnePeerSelected.bind(true));

    peers.forEach((peer) => {
      checks.addControl(peer.name, new FormControl(false))
    });

    return checks;
  }

  private hasAtLeastOnePeerSelected(form) {
    const value = form.value;
    const checkedNo: number = Object.keys(value).filter((peer) => value[peer]).length;
    let errors: any = null;

    if (value && checkedNo < 1) {
      if (!errors) errors = {};
      errors.atLeastOneSelected = true;
    }

    return errors;
  }
}
