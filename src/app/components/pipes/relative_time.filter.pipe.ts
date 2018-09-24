import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', pure: false })
export class RelativeTimeFilterPipe implements PipeTransform {
  transform(value: number, direction: string): string {
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const now = new Date();
    let then = new Date(value);

    let calculateDelta;
    
    if(direction === 'up'){
      if(now <= then){
        return '';
      }
      calculateDelta = (now, then) => Math.round(Math.abs(now - then) / 1000);
    } else if (direction === 'down'){
      if(then <= now){
        return '';
      }
      calculateDelta = (now, then) => Math.round(Math.abs(then - now) / 1000);
    } else {
      console.error('Wrong pipe argument');
      return 
    }
    
    
    var t = calculateDelta(now, then);

    var days, hours, minutes, seconds, timer='';
    days = Math.floor(t / 86400);
    t -= days * 86400;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;

    if(days > 8){
        return '';
    }

    if (days > 0){
      timer+=days + 'd ';
    }
    if (hours > 0){
      timer+=hours + 'h ';
    }
    if (minutes > 0){
      timer+=minutes + 'm ';
    }
    if (seconds > 0){
      timer+=seconds + 's';
    }

    return timer;
  }
}