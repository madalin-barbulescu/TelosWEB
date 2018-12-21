import { Component } from '@angular/core';
import { FoundationService } from './services/foundation.service';
import { HttpClient } from '@angular/common/http';
import { ScatterService } from '../../services/scatter.service';

@Component({
  selector: 'foundation-page',
  templateUrl: './foundation.component.html',
  styleUrls: ['./foundation.component.css']
})
export class FoundationPageComponent {
  isLoading: boolean = false;
  readonly routeLinks;
  activeLinkIndex: number;
  store$ = this._foundationService.store$;

  constructor(
    private _foundationService: FoundationService,
    private _http: HttpClient,

    public scatterService: ScatterService
  ) {
    this.routeLinks = [
      { link: './members', label: 'Board Members', disabled: false },
      { link: './election', label: 'Election', disabled: false },
      // TODO: uncomment this after the issues page is implemented
      // { link: './issues', label: 'Issues', disabled: true }
    ];
    this.activeLinkIndex = 0;
  }

  login() {
    this.isLoading = true;

    this.scatterService.login$()
      .finally(() => this.isLoading = false)
      .subscribe();
  }

  logout() {
    this.isLoading = true;

    this.scatterService.logout$()
      .do(() => location.reload())
      .subscribe();
  }

  ngOnInit() {
    this._getConfig$()
      .do((config: any[]) => this._foundationService.updateConfig(config))
      .subscribe();
  }

  private _getConfig$() {
    return this._http.get(`/api/v1/foundation/get-config`);
  }
  
}
