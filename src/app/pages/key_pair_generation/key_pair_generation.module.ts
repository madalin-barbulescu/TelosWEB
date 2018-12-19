import { NgModule } from '@angular/core';
import { KeyPairGenerationPageComponent } from './key_pair_generation.component';
import {
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import { CommonModule } from '@angular/common';

import { ClipboardService } from '../../services/clipboard.service';
import { KeyPairService } from '../../services/key-pair.service';

const imports = [
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  CommonModule
];

const services = [
  ClipboardService,
  KeyPairService
];

@NgModule({
  declarations: [
    KeyPairGenerationPageComponent
  ],
  imports: [ ...imports ],
  providers: [ ...services ],
  bootstrap: [ KeyPairGenerationPageComponent ]
})
export class KeyPairGenerationPageModule {}
