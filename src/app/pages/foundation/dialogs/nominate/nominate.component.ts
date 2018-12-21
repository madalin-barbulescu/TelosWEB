import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { INominateDialog } from './nominate.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'nominate-modal',
  templateUrl: './nominate.component.html',
  styleUrls: ['./nominate.component.css']
})
export class NominateDialog implements OnInit {
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<INominateDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    this.formGroup = this.newFormGroup();
  }

  closeDialog(isOk: boolean) {
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    if (!this.formGroup.valid) return;

    const value = this.formGroup.value;
    this.dialogRef.close(value);
  }

  private newFormGroup() {
    return new FormGroup({
      nominee: new FormControl('', [Validators.required])
    });
  }
}



















