import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import * as moment from 'moment';
import { tileLayer, latLng, marker, circle, polygon } from 'leaflet';
import { MainService } from '../../services/mainapp.service';
import { forkJoin } from "rxjs/observable/forkJoin";
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'producer',
  templateUrl: './producer_page.component.html',
  styleUrls: ['./producer_page.component.css']
})
export class ProducerComponent implements OnInit, OnDestroy{
  spinner = false;
  displayedColumns = ['#', 'Name', 'Key', 'Url', 'Votes', 'Rate'];
  dataSource;
  eosToInt = Math.pow(10, 13);
  totalProducerVoteWeight;
  producer;
  producerId;
  mainElement: any = {};
  bpData;
  rateProducersArr;
  supply;

  options = {
    layers: [
       tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18, attribution: 'TELOSweb' })
    ],
    zoom: 1,
    center: latLng(0, 0)
  };
  
  layers = [];

  constructor(private route: ActivatedRoute, protected http: HttpClient, private MainService: MainService, private notifications:NotificationsService){}

  getData(){
      this.spinner = true;
  		let producerDetails = this.http.get(`/api/v1/get_producer/${this.producerId}`); 
  		let producers       = this.http.get(`/api/v1/get_producers/0/51`); 
      let stat            = this.http.get(`/api/v1/get_table_rows/eosio.token/TLOS/stat/1`);

      forkJoin([producerDetails, producers, stat])
  				 .subscribe(
                      (res: any) => {
                          const producers = res[1];
                          const details = res[0];
                          const stat = res[2].rows[0];

                          this.totalProducerVoteWeight = producers.total_producer_vote_weight;
                          this.supply = Number(stat.supply.replace(/[^0-9.-]+/g,""));
                          this.mainElement = details.list[0];
                          if(this.mainElement.details){
                            this.mainElement.geoLocation = [this.mainElement.details.latitude, this.mainElement.details.longitude];
                          }
                          
                          const prod = this.findProducer(this.MainService.countRate(producers.list, this.totalProducerVoteWeight, this.supply));
                          if(prod){
                            this.mainElement.rate = prod.votes;
                            this.mainElement.rewards = prod.rewards;
                            this.mainElement.index = prod.index;
                          }else{
                            this.mainElement.rate = (this.mainElement.total_votes * 100 / this.totalProducerVoteWeight).toFixed(4);
                            this.mainElement.rewards = 0;
                            this.mainElement.index = "52+ (Candidate)";
                          }
                          
                          this.getBP(this.mainElement);
                          this.spinner = false;
                      },
                      (error) => {
                          console.error(error);
                          this.spinner = false;
                      });
  };

  findProducer(data) {
      if(!data){
        return;
      }
      let result = null;
      data.forEach((elem, index) => {
          if (elem.owner === this.producerId){
              result = elem;
          }
      });
      return result;
  }

  getBP(elem){
    if (!elem || !elem.url){
      return console.log(elem);
    }
    this.http.post(`/api/producer`, { url: `${elem.url}/bp.json` })
              .subscribe(
              (res: any) => {
                  this.bpData = res;
                  // try to get the handle only , for those cases that have the full link
                  if(this.bpData && this.bpData.org && this.bpData.org.social){
                    const socialMedias = ["facebook","reddit","telegram","twitter","github","steemit","keybase"];
                    console.log(this.bpData.org.social);
                    socialMedias.forEach(media => {
                      if(this.bpData.org.social[media] && this.bpData.org.social[media].indexOf('/') > -1){
                        const pos = this.bpData.org.social[media].lastIndexOf("/") + 1;
                        this.bpData.org.social[media] = this.bpData.org.social[media].substring(pos);
                      }
                    });
                  }

                  if (res.nodes && res.nodes.length){
                      res.nodes.forEach(e => {
                        if (e.location && e.location.latitude && e.location.longitude){
                          this.layers.push(circle([ e.location.latitude, e.location.longitude ], { radius: 1000, color: "#4444FF" }));
                        }
                      });
                  }
              },
              (err) => {
                if(elem.geoLocation){
                  this.layers.push(circle(elem.geoLocation, { radius: 1000, color: "#00FF00" }));
                  this.bpData = {
                    org:{
                      location:{
                        country: elem.details.country,
                        latitude: elem.geoLocation[0],
                        longitude: elem.geoLocation[1],
                        name: elem.details.region
                      }
                    },
                    nodes:[]
                  }
                }
                
                if(err.error && err.error.error){
                  err.error.error.message = "bp.json : " + err.error.error.message;
                  this.notifications.error(err.error.error);
                }
                console.error(err.error);
              });
  }

  ngOnInit() {
     this.producer = this.route.params.subscribe(params => {
       this.producerId = params['id'];
       this.getData();
    });
  }

  ngOnDestroy() {
    this.producer.unsubscribe(); 
    //this.subscription.unsubscribe();
  }
}







