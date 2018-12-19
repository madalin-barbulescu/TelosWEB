import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule,
} from '@angular/material';
import { appRoutes } from '../../main.router';

import { ClipboardService } from '../../services/clipboard.service';
import { MainService } from '../../services/mainapp.service';
import { ContractTableService } from './services/contract-table.service';

import { ContractActionsComponent } from './contract-actions/contract-actions.component';
import { ContratTableComponent } from './contract-table/contract-table.component';
import { ContractsPageComponent } from './contracts.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

const components: any[] = [
  ContractActionsComponent,
  ContratTableComponent,
  ContractsPageComponent
];

const modules: any[] = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  appRoutes,

  MatAutocompleteModule,
  MatCardModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule,
  NgxJsonViewerModule,
];

const providers = [
  ClipboardService,
  MainService,
  ContractTableService
];

@NgModule({
  declarations: [ ...components ],
  entryComponents: [ ContractsPageComponent ],
  imports: [ ...modules ],
  providers: [ ...providers ],
  bootstrap: [ ContractsPageComponent ]
})
export class ContractsModule {}
