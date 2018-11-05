import { NgModule } from '@angular/core';
import { KeyPairGenerationPageComponent } from './key_pair_generation.component';
import {
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import { CommonModule } from '@angular/common';

import { Clipboard } from '../../services/clipboard.service';

const imports = [
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  CommonModule
];

@NgModule({
  declarations: [
    KeyPairGenerationPageComponent
  ],
  imports:  imports,
  providers: [Clipboard],
  bootstrap: [ KeyPairGenerationPageComponent ]
})
export class KeyPairGenerationPageModule {}
