import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { IInfoDialog } from './info-dialog.model';

@Component({
  selector: 'info-dialog-modal',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css']
})
export class InfoDialog {

  constructor(
    public dialogRef: MatDialogRef<IInfoDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}


  closeDialog(isOk: boolean) {
    this.dialogRef.close(isOk);
  }
}



















