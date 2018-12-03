import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatTableModule,
} from '@angular/material';

import { AdminComponent } from './admin.component';
import { P2PageEditComponent } from './p2p-edit/p2p-edit.component';
import { P2PageManagementComponent } from './p2p-management/p2p-management.component';

import { appRoutes } from '../../main.router';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    appRoutes,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  declarations: [
    AdminComponent,
    P2PageEditComponent,
    P2PageManagementComponent
  ]
})
export class AdminModule { }
