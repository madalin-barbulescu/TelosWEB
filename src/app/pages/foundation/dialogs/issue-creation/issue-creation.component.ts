import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { IIssueCreationDialog } from './issue-creation.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'issue-creation-modal',
  templateUrl: './issue-creation.component.html',
  styleUrls: ['./issue-creation.component.css']
})
export class IssueCreationDialog implements OnInit {
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<IIssueCreationDialog>,
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
      name: new FormControl('', [Validators.required]),
      url: new FormControl('', [Validators.required]),
      transaction: new FormControl('', [Validators.required])
    });
  }
}



















