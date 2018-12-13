import { NgModule } from '@angular/core';
import { VotePageComponent, DialogDataMemo } from './vote.component';
import { MatAutocompleteModule,
         MatButtonModule,
         MatInputModule,
         MatPaginatorModule,
         MatProgressSpinnerModule,
         MatProgressBarModule,
         MatSelectModule,
         MatSortModule,
         MatTableModule,
         MatFormFieldModule,
         MatExpansionModule,
         MatTabsModule,
         MatDialogModule,
         MatChipsModule,
         MatIconModule, 
         MatListModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { appRoutes } from '../../main.router';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MainService } from '../../services/mainapp.service';
import { ActionsViewerModule } from '../../components/actions_view/action_viewer.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgxChartsModule} from '@swimlane/ngx-charts';
import { ScatterService } from '../../services/scatter.service';

let imports = [
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    CommonModule,
    appRoutes,
    MatExpansionModule,
    NgxJsonViewerModule,
    MatTabsModule,
    MatListModule,
    MatDialogModule,
    ActionsViewerModule,
    NgxChartsModule,
    FormsModule,
    ReactiveFormsModule ];

@NgModule({
  declarations: [
    VotePageComponent,
    DialogDataMemo
  ],
  entryComponents: [VotePageComponent, DialogDataMemo],
  imports:  imports,
  providers: [MainService, ScatterService],
  bootstrap: [ VotePageComponent ]
})
export class VotePageModule {}


