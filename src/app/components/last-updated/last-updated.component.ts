import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
  } from '@angular/core';
  
import { Observable } from '../../../../node_modules/rxjs';

  
  @Component({
    selector: 'last-updated',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './last-updated.component.html',
    styleUrls: ['./last-updated.component.css']
  })
  export class LastUpdatedComponent {
    @Input()
    timestamp: number;
    @Input()
    direction: string;
  
    // lastUpdated$ = Observable.merge(
    //   Observable.interval(1000).take(59),
    //   Observable.interval(60000)
    // ).map(() => this.timestamp);

    lastUpdated$ = Observable.merge(
      Observable.interval(1000)
    ).map(() => this.timestamp);
  }