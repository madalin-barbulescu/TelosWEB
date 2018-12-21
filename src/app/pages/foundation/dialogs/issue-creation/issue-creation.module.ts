import { NgModule } from '@angular/core';
import { IssueCreationDialog } from './issue-creation.component';
import { MatAutocompleteModule,
         MatButtonModule,
         MatInputModule,
         MatPaginatorModule,
         MatProgressSpinnerModule,
         MatSelectModule,
         MatSortModule,
         MatTableModule,
         MatFormFieldModule, 
         MatDialogModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { appRoutes } from '../../../../main.router';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

let imports = [
  MatAutocompleteModule,
  MatButtonModule,
  MatFormFieldModule,
  MatDialogModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSortModule,
  MatTableModule,

  CommonModule,
  appRoutes,
  NgxJsonViewerModule,
  FormsModule,
  ReactiveFormsModule,
];

const components = [
  IssueCreationDialog
];

@NgModule({
  declarations: [
    ...components
  ],
  entryComponents: [ ...components ],
  imports:  imports,
  exports: [ ...components ],
  providers: [ ]
})
export class IssueCreationModule {}


