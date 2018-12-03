import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { IInterrogationDialog } from './interrogation.model';

@Component({
  selector: 'interrogation-modal',
  templateUrl: './interrogation.component.html',
  styleUrls: ['./interrogation.component.css']
})
export class InterrogationDialog {

  constructor(
    public dialogRef: MatDialogRef<IInterrogationDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}


  closeDialog(isOk: boolean) {
    this.dialogRef.close(isOk);
  }
}



















