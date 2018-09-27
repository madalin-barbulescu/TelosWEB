import { NgModule } from '@angular/core';
import { InfoPageComponent } from './info.component';
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
import { FormsModule } from '@angular/forms';


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
    FormsModule ];

@NgModule({
  declarations: [
    InfoPageComponent
  ],
  imports:  imports,
  providers: [],
  bootstrap: [ InfoPageComponent ]
})
export class InfoPageModule {}


