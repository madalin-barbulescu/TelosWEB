import { Injectable } from '@angular/core';

@Injectable()
export class ClipboardService {

  constructor() {}

  copy(data: any): void {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('display', 'none');
    textarea.value = data;

    document.body.appendChild(textarea);
    textarea.select();

    document.execCommand('copy');

    document.body.removeChild(textarea);
  }
}