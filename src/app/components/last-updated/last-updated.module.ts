import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LastUpdatedComponent } from './last-updated.component';
import { RelativeTimeFilterPipe } from '../pipes/relative_time.filter.pipe';

let imports = [CommonModule];

@NgModule({
  declarations: [
    LastUpdatedComponent,
    RelativeTimeFilterPipe,
  ],
  imports:  imports,
  exports: [ LastUpdatedComponent ],
  providers: [],
  bootstrap: [ LastUpdatedComponent ]
})
export class LastUpdatedModule {}


