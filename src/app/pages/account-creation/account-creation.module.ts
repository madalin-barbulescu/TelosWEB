import { NgModule } from '@angular/core';
import { AccountCreationPageComponent } from './account-creation.component';
import { MatAutocompleteModule,
         MatButtonModule,
         MatInputModule,
         MatPaginatorModule,
         MatProgressSpinnerModule,
         MatProgressBarModule,
         MatSelectModule,
         MatSortModule,
         MatTableModule,
         MatTabsModule,
         MatFormFieldModule,
         MatMenuModule,
         MatDialogModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { appRoutes } from '../../main.router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';


let imports = [
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    CommonModule,
    appRoutes,
    NgxChartsModule,
    FormsModule,
    ReactiveFormsModule
  ];

@NgModule({
  declarations: [
    AccountCreationPageComponent
  ],
  imports:  imports,
  providers: [],
  bootstrap: [ AccountCreationPageComponent ]
})
export class AccountCreationPageModule {}


