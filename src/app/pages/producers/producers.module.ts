import { NgModule } from '@angular/core';
import { ProducersPageComponent } from './producers.component';
import { MatAutocompleteModule,
         MatButtonModule,
         MatInputModule,
         MatPaginatorModule,
         MatProgressSpinnerModule,
         MatSelectModule,
         MatSortModule,
         MatTableModule,
         MatFormFieldModule, 
         MatProgressBarModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { appRoutes } from '../../main.router';
import { MainService } from '../../services/mainapp.service';
import { LastUpdatedModule } from '../../components/last-updated/last-updated.module';
import { LeafletModule } from '../../../../node_modules/@asymmetrik/ngx-leaflet';


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
    CommonModule,
    LastUpdatedModule,
    LeafletModule,
    appRoutes ];

@NgModule({
  declarations: [
    ProducersPageComponent,
  ],
  imports:  imports,
  providers: [MainService],
  bootstrap: [ ProducersPageComponent ]
})
export class ProducersPageModule {}


