import { NgModule } from '@angular/core';
import { FoundationPageComponent } from './foundation.component';
import {
  MatButtonModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatTabsModule,
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NominateModule } from './dialogs/nominate/nominate.module';
import { IssueCreationModule } from './dialogs/issue-creation/issue-creation.module';

import { FoundationBoardMembersPageComponent } from './foundation-board-members/foundation-board-members.component';
import { FoundationElectionPageComponent } from './foundation-election/foundation-election.component';
import { FoundationIssuesPageComponent } from './foundation-issues/foundation-issues.component';

import { FoundationService } from './services/foundation.service';
import { CandidateAddModule } from './dialogs/candidate-add/candidate-add.module';
import { LastUpdatedModule } from '../../components/last-updated/last-updated.module';


const imports = [
  MatButtonModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatTabsModule,

  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,

  CandidateAddModule,
  NominateModule,
  IssueCreationModule,
  LastUpdatedModule
];

const components = [
  FoundationPageComponent,
  FoundationBoardMembersPageComponent,
  FoundationElectionPageComponent,
  FoundationIssuesPageComponent
];

@NgModule({
  declarations: [ ...components ],
  imports: [ ...imports ],
  providers: [ FoundationService ],
  bootstrap: [ ...components ]
})
export class FoundationPageModule {}


