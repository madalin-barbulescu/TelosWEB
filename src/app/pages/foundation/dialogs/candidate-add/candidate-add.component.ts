import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { ICandidateAddDialog } from './candidate-add.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'candidate-add-modal',
  templateUrl: './candidate-add.component.html',
  styleUrls: ['./candidate-add.component.css']
})
export class CandidateAddDialog implements OnInit {
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ICandidateAddDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    this.formGroup = this.newFormGroup();
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
      info_link: new FormControl('', [Validators.required])
    });
  }
}



















