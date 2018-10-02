import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'faucet-page',
  templateUrl: './faucet.component.html',
  styleUrls: ['./faucet.component.css']
})
export class FaucetPageComponent implements OnInit {
  faucetFGroup: FormGroup;
  isLoading: boolean = false;

  //regex
  readonly PRODUCER_NAME_REGEX = new RegExp(/^[a-z1-5_\-]+$/);

  constructor(
    protected http: HttpClient, 
    private notifications: NotificationsService
  ) { }

  send() {
    if (!this.faucetFGroup.valid) return;
    this.isLoading = true;

    const dataToSend = Object.assign({}, this.faucetFGroup.value);

    this.faucet(dataToSend)
      .finally(() => this.isLoading = false)
      .subscribe(
        () => this.notifications.success('100 TLOS sent'),
        error => {
          const message =  !error.data ? error.message : (error.data.what ? error.data.what : error.message);
          this.notifications.error(message);
        }
      );
  }

  ngOnInit() {
    this.faucetFGroup = this.newFaucetForm();
  }

  faucet(data) {
    return this.http.post(`/api/v1/gettlos`, data)
      .catch(err => {
        console.log(err);
        return Observable.throw(err.error);
      });
  }

  private newFaucetForm() {
    return new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(this.PRODUCER_NAME_REGEX)
      ])
    });
  }
}







