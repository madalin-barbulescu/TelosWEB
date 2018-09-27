import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';
import { forkJoin } from "rxjs/observable/forkJoin";
import { MainService } from '../../services/mainapp.service';
import { Socket } from 'ng-socket-io';
import { Observable, Subscription } from '../../../../node_modules/rxjs';
import { tileLayer, latLng, marker, circle, polygon } from 'leaflet';

@Component({
  selector: 'producers-page',
  templateUrl: './producers.component.html',
  styleUrls: ['./producers.component.css']
})
export class ProducersPageComponent implements OnInit, OnDestroy {
  private reloadDateSubscription: Subscription;

  ROTATION_INTERVAL: number = 6 * 60 * 60 * 1000; //every 6 hours
  DATA_RELOAD: number = 60 * 2000; //every 2 minutes

  mainData;
  spinner = false;
  displayedColumns = ['#', 'Name', 'Status', 'Url', 'Last block', 'Last time produced', 'Next rotation', 'Votes'];
  dataSource;
  eosToInt = Math.pow(10, 13);
  totalProducerVoteWeight;
  sortedArray;
  votesToRemove;
  supply;
  blockChainInfo;
  lastProducerIndex = -1;
  voteProgression;
  rotations;
  nextRotation$: Observable<number>;
  nextRotationMessage;
  firstBlockProduced;
  producersSavedInfo: any = {};
  mapOpen: boolean = false;
  topProducers: any = {};

  options;
  layers = [];
  lastMapUpdate = [];

  constructor(private socket: Socket, protected http: HttpClient, private MainService: MainService) { }

  ngOnInit() {
    this.getBlockData();

    this.reloadDateSubscription = Observable.interval(this.DATA_RELOAD)
      .subscribe((val) => {
        this.getBlockData();
      });

    this.socket.on('get_info', res => {
      this.blockChainInfo = res;
      this.setProducingInfo();
    });
  }

  ngOnDestroy() {
    if (this.reloadDateSubscription)
      this.reloadDateSubscription.unsubscribe();
  }

  showMap(){
    this.options = {
      layers: [
         tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18, attribution: 'Telos' })
      ],
      zoom: 1.2,
      center: latLng(0, 0)
    };
    this.mapOpen = !this.mapOpen;
  }

  putProducersOnMap(producers){
    if(this.lastMapUpdate.length){
      this.layers.splice(this.lastMapUpdate[0], this.lastMapUpdate[1]);
    }
    this.lastMapUpdate[0] = this.layers.length;
    this.lastMapUpdate[1] = 0;
    for(let i = 0; i < producers.length; i++){
      if(!producers[i].location) continue;

      this.layers.push(circle(producers[i].location, { radius: 1000 }));
      this.lastMapUpdate[1]++;
    }
  }

  getBlockData() {
    this.spinner = true;
    let producers = this.http.get(`/api/custom/get_table_rows/eosio/eosio/producers/500`);
    let global = this.http.get(`/api/v1/get_table_rows/eosio/eosio/global/1`);
    let stat = this.http.get(`/api/v1/get_table_rows/eosio.token/TLOS/stat/1`);
    let rotations = this.http.get('/api/v1/get_table_rows/eosio/eosio/rotations/500')
    let schedule = this.http.get('/api/custom/get_producer_schedule');

    forkJoin([producers, global, stat, rotations, schedule])
      .subscribe(
        (results: any) => {
          this.mainData = results[0].rows;

          results[4].active.producers.forEach(element => {
            this.topProducers[element.producer_name] = element.block_signing_key;
          });

          if (this.producersSavedInfo) {
            this.mainData.forEach((element, index) => {
              if(this.topProducers[element.owner]){
                this.mainData[index].total_votes += 1;
              }
              if (this.producersSavedInfo[element.owner]) {
                this.mainData[index].last_block_produced = this.producersSavedInfo[element.owner].lastBlockProduced;
                this.mainData[index].last_time_produced = this.producersSavedInfo[element.owner].lastTimeProduced;
              }
            });
          }
          this.blockChainInfo = results[1].rows;
          this.totalProducerVoteWeight = results[1].rows[0].total_producer_vote_weight;
          this.supply = Number(results[2].rows[0].supply.replace(/[^0-9.-]+/g, ""));
          this.rotations = results[3].rows[0];
          this.rotations.last_rotation_time = new Date(Date.parse(this.rotations.last_rotation_time + 'Z'));
          this.rotations.next_rotation_time = new Date(Date.parse(this.rotations.next_rotation_time + 'Z'));
          this.voteProgression = (results[1].rows[0].total_activated_stake / 10000 / this.supply * 100).toFixed(2);

          this.putProducersOnMap(results[4].active.producers);

          let ELEMENT_DATA: Element[] = this.MainService.countRate(this.swapAndLabelProducers(this.MainService.sortArray(this.mainData), this.rotations), this.totalProducerVoteWeight, this.supply);
          this.dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
          this.dataSource.filterPredicate = (data, filter) => data.owner.toLowerCase().indexOf(filter) > -1 || data.votes.toLowerCase().indexOf(filter) > -1;
          this.spinner = false;

          this.nextRotation$ = Observable.interval(1000).map((x) => {
            return Math.floor((new Date(this.rotations.next_rotation_time).getTime() - new Date().getTime()) / 1000);
          });
          this.nextRotation$.subscribe((x) => {
            this.nextRotationMessage = this.dhms(x);
          });
        },
        (error) => {
          console.error(error);
          this.spinner = false;
        });
  }

  setProducingInfo() {
    if (this.dataSource) {
      if (!this.firstBlockProduced) {
        this.firstBlockProduced = this.blockChainInfo.head_block_num;
      }
      this.dataSource.data.forEach((producer, index) => {
        if (producer.owner === this.blockChainInfo.head_block_producer) {
          if (this.lastProducerIndex !== -1) {
            this.dataSource.data[this.lastProducerIndex].producing = false;
            this.dataSource.data[this.lastProducerIndex].label = this.dataSource.data[this.lastProducerIndex].label.replace('+', '');
          }
          this.lastProducerIndex = index;
          this.dataSource.data[index].producing = true;
          this.dataSource.data[index].label = "+" + this.dataSource.data[index].label
          this.dataSource.data[index].last_block_produced = this.blockChainInfo.head_block_num;
          this.dataSource.data[index].last_time_produced = new Date().getTime();
          this.producersSavedInfo[producer.owner] = { 'lastBlockProduced': this.dataSource.data[index].last_block_produced, 'lastTimeProduced': this.dataSource.data[index].last_time_produced };
        }
      });
    }
  }

  swapAndLabelProducers(data, rotation) {
    var a, b;
    var totalActive = 0, totalStandby = 0;
    for (var index = 0; index < data.length; index++) {
      let element = data[index];

      if (element.owner === rotation.bp_currently_out) {
      // if (index === rotation.bp_out_index) {
        a = index;
        element.label = 'Standby';
        element.nextRotationTime = new Date(this.rotations.next_rotation_time).getTime();
        totalStandby += 1;
      } else if (element.owner === rotation.sbp_currently_in) {
      // } else if (index === rotation.sbp_in_index) {
        b = index;
        element.label = 'Active';
        element.nextRotationTime = new Date(this.rotations.next_rotation_time).getTime();
        totalActive += 1;
      }
      if (!element.is_active) {
        element.label = 'Inactive';
      } else {
        if (index < 21 && !element.label) {
          element.label = 'Active';
          totalActive += 1;
        } else if (index > 20 && !element.label && index < 50) {
          element.label = 'Standby';
          totalStandby += 1;
        } else if (!element.label) {
          element.label = 'Candidate';
        }
      }
    }

    /**
     * x = next time from rotation table = new Date(this.rotations.next_rotation_time).getTime()
     * y = this.ROTATION_INTERVAL = 6hrs
     * z = number of intervals for current position = (pos - this.rotations.bp_out_index + (<any>(pos < this.rotations.bp_out_index) * (totalActive - 1))
     * x + y * z = next rotation time for current position
     * 
     * pos = current position without the rotated member = if (i < a) then i else i-1   (a = current position for rotated member)
     * this.rotations.bp_out_index = last position for rotated member
     * (pos < this.rotations.bp_out_index) * (totalActive - 1) = if (pos < bp_out_index) then (totalActive - 1) else 0
     */

    let pos = 0;
    for (var i = 0; i < totalActive; i++) {
      if (i === a)
        continue;
      data[i].nextRotationTime = new Date(this.rotations.next_rotation_time).getTime() + this.ROTATION_INTERVAL * (pos - this.rotations.bp_out_index + (<any>(pos < this.rotations.bp_out_index) * (totalActive - 1)));
      pos++;
    }

    pos = totalActive;
    for (var i = totalActive; i < totalStandby + totalActive; i++) {
      if (i === b)
        continue;
      data[i].nextRotationTime = new Date(this.rotations.next_rotation_time).getTime() + this.ROTATION_INTERVAL * (pos - this.rotations.sbp_in_index + (<any>(pos < this.rotations.sbp_in_index) * (totalStandby - 1)));
      pos++;
    }

    let swap = data[a];
    data[a] = data[b];
    data[b] = swap;
    return data;
  }


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dhms(t) {
    if (t === 0) {
      return '-';
    }
    var days, hours, minutes, seconds, timer = '';
    days = Math.floor(t / 86400);
    t -= days * 86400;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;

    if (days > 0) {
      timer += days + 'd ';
    }
    if (hours) {
      timer += hours + 'h ';
    }
    if (minutes) {
      timer += minutes + 'm ';
    }
    if (seconds) {
      timer += seconds + 's';
    }

    return timer;
  }
}







