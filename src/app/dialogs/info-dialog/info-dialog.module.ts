import { NgModule, PLATFORM_ID,  Inject } from '@angular/core';
import { InfoDialog } from './info-dialog.component';
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
import { appRoutes } from '../../main.router';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

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
    NgxJsonViewerModule ];

const components = [
  InfoDialog
];

@NgModule({
  declarations: [
    ...components
  ],
  entryComponents: [ ...components ],
  imports:  imports,
  exports: [ ...components ],
  providers: [ ],
  // bootstrap: [ ...components ]
})
export class InfoDialogModule {}


