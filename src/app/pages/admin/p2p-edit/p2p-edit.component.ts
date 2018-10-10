import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import * as ecc from 'eosjs-ecc';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/concatMap";

@Component({
  selector: 'app-p2p-edit',
  templateUrl: './p2p-edit.component.html',
  styleUrls: ['./p2p-edit.component.css']
})
export class P2PageEditComponent implements OnInit {
  updateFGroup: FormGroup;
  protocols: any[];
  isLoading: boolean = false;
  hide: boolean = true;

  //regex
  readonly EMAIL_REGEX = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i);
  readonly PRODUCER_NAME_REGEX = new RegExp(/^[a-z1-5_\-]+$/);
  readonly URL_REGEX_WITH_PORT = new RegExp(/^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,}):[0-9]+$/);
  readonly URL_REGEX = new RegExp(/^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/);
  readonly IP_REGEX = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]+$/g);

  readonly INIT_FORM_VALUE: any;

  constructor(
    protected http: HttpClient, 
    private notifications: NotificationsService,
    private route: ActivatedRoute
  ) {
    this.protocols = [{
      label: 'HTTPS',
      value: 'https',
      field: 'httpsServerAddress'
    }, {
      label: 'HTTP',
      value: 'http',
      field: 'httpServerAddress'
    }];

    this.INIT_FORM_VALUE = {
      name: '',
      organization: '',
      protocol: this.protocols[0].value,
      serverIPAddress: '',
      p2pServerAddress: '',
      producerPublicKey: '',
      telegramChannel: '',
      email: '',
      url: ''
    }
  }

  send() {
    if (!this.updateFGroup.valid) return;
    this.isLoading = true;

    const value = Object.assign({}, this.updateFGroup.value);

    let dataToSend: any = {
      producer: {
        name: value.name,
        organization: value.organization,
        p2pServerAddress: value.p2pServerAddress,
        producerPublicKey: value.producerPublicKey,
        telegramChannel: value.telegramChannel,
        email: value.email,
        url: value.url,
      }
    };

    this.setServerAddress(dataToSend.producer, value);

    try {
      dataToSend.signature = ecc.sign(JSON.stringify(dataToSend.producer), value.privateKey);
    } catch(error) {
      this.notifications.error('Error', error.message);
      return;
    }

    this.updatePeer(dataToSend)
      .finally(() => this.isLoading = false)
      .subscribe(
        data => this.notifications.success(`${dataToSend.producer.name} has been updated!`),
        error => {
          const message = error.data.message ? error.data.message : error.message;
          this.notifications.error(message);
        }
      );
  }

  
  ngOnInit() {
    this.updateFGroup = this.newRegisterForm();
    this.updateFGroup.patchValue(this.INIT_FORM_VALUE);
    
    
    this.route.params
      .take(1)
      .concatMap((params) => this.get(params['name']))
      .subscribe();
  }

  get(name: string) {
    this.isLoading = true;

    return this.http.get(`/api/v1/p2p/${name}`)
      .map((results) => {
        let data: any = Object.assign({}, results);

        if (data.httpsServerAddress) {
          data.protocol = this.protocols[0].value;
          data.serverIPAddress = data.httpsServerAddress;
        } else {
          data.protocol = this.protocols[1].value;
          data.serverIPAddress = data.httpServerAddress;
        }

        return data;
      })
      .do((result) => this.updateFGroup.patchValue(result))
      .finally(() => this.isLoading = false);
  }

  updatePeer(data) {
    return this.http.patch(`/admin/v1/p2p`, data)
      .catch(err => {
        console.log(err);
        return Observable.throw(err.error);
      });
  }

  private newRegisterForm() {
    return new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(this.PRODUCER_NAME_REGEX)
      ]),
      organization: new FormControl(''),
      protocol: new FormControl(''),
      serverIPAddress: new FormControl('', [
      ], this.validateAddress.bind(this)),
      p2pServerAddress: new FormControl('', [
      ], this.validateAddress.bind(this)),
      privateKey: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/)
      ]),
      telegramChannel: new FormControl(''),
      email: new FormControl('', [
        Validators.pattern(this.EMAIL_REGEX)
      ]),
      url: new FormControl('', [
      ], this.getUrlValidationState.bind(this)),
    });
  }

  private validateAddress(form: FormControl) {
    let errors: any = null;
    let value = form.value;

    if (!value) return Observable.of(errors);

    if (value.indexOf('http://') === 0)
      value = value.slice(7);
    else if (value.indexOf('https://') === 0)
      value = value.slice(8);

    if (value &&
        !this.hasValidPortNumber(value) &&
          (!this.URL_REGEX_WITH_PORT.test(value) ||
          !this.IP_REGEX.test(value))
        ) {
      if (!errors)
        errors = {};
      errors.patterns = true;
    }

    return Observable.of(errors);
  }

  private hasValidPortNumber(validationTarget) {
    const portNumber = validationTarget.slice(validationTarget.lastIndexOf(':') + 1);

    if (!portNumber) return false;
    if (isNaN(portNumber)) return false;
    if (parseInt(portNumber) > 65535) return false;
    if (parseInt(portNumber) < 0) return false;

    return true;
  }

  private getUrlValidationState(form: FormControl) {
    let errors: any = null;
    let value = form.value;

    if (!value) return Observable.of(errors);

    if (value.indexOf('http://') === 0)
      value = value.slice(7);
    else if (value.indexOf('https://') === 0)
      value = value.slice(8);

    if (!this.URL_REGEX.test(value) && !this.URL_REGEX_WITH_PORT.test(value)) {
      if (!errors)
        errors = {};
      errors.patterns = true;
    }

    return Observable.of(errors);
  }

  private setServerAddress(dataToSend, formValue) {
    this.protocols.forEach((protocol) => {
      if (protocol.value === formValue.protocol) {
        dataToSend[protocol.field] = this.separateProtocol(formValue.serverIPAddress);
        return;
      }
    });
  }

  private separateProtocol(value) {
    if (value.indexOf('http://') === 0)
      return value.slice(7);
    else if (value.indexOf('https://') === 0)
      return value.slice(8);
    else return value;
  }
}
