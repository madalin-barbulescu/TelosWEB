import { NgModule } from '@angular/core';
import { FaucetPageComponent } from './faucet.component';
import {
  MatButtonModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatFormFieldModule
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


let imports = [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ];

@NgModule({
  declarations: [
    FaucetPageComponent
  ],
  imports:  imports,
  providers: [],
  bootstrap: [ FaucetPageComponent ]
})
export class FaucetPageModule {}


