import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Inject, APP_ID, PLATFORM_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule,
         MatFormFieldModule,
         MatInputModule,
         MatSelectModule,
         MatMenuModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CdkTableModule } from '@angular/cdk/table'; 

import { AppComponent } from './app.component';
import { appRoutes, appRoutingProviders } from './main.router';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SimpleNotificationsModule } from 'angular2-notifications';
//import { AuthService } from './services/auth.service';

import { FaucetPageModule } from './pages/faucet/faucet.module';
import { InfoPageModule } from './pages/info/info.module';
import { InterrogationModule } from './dialogs/interrogation/interrogation.module';
import { MainPageModule } from './pages/main_page/main_page.module';
import { BlockPageModule } from './pages/block/block.module';
import { TokensPageModule } from './pages/tokens/tokens.module';
import { P2PageModule } from './pages/p2p/p2p.module';
import { ProducersPageModule } from './pages/producers/producers.module';
import { ProducerModule } from './pages/producer_page/producer_page.module';
import { AnalyticsPageModule } from './pages/analytics/analytics.module';
import { RamPageModule } from './pages/ram/ram.module';
import { RegistrationPageModule } from './pages/registration/registration.module';
import { TransactionPageModule } from './pages/transactions/transactions.module';
import { WalletPageModule } from './pages/wallet/wallet.module';
import { VotePageModule } from './pages/vote/vote.module';
import { AccountCreationPageModule } from './pages/account-creation/account-creation.module';
import { AccountPageModule } from './pages/account/account.module';
import { AddressPageModule } from './pages/address/address.module';
import { ContractsModule } from './pages/contracts/contracts.module';
import { FoundationPageModule } from './pages/foundation/foundation.module';
import { KeyPairGenerationPageModule } from './pages/key_pair_generation/key_pair_generation.module';
import { SoonModule } from './pages/soon/soon.module';
import { MainTcustomizeModule } from './components/main_customize_charts/main_tcustomize.module';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { AdminModule } from './pages/admin/admin.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { InfoDialogModule } from './dialogs/info-dialog/info-dialog.module';
import { EOSService } from './services/eos.service';
import { ScatterService as ScatterServiceAux } from './services/scatter.service';

const socketConfig: SocketIoConfig = { url: '/', options: {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 5
}};

const providers = [
  appRoutingProviders,
  EOSService,
  ScatterServiceAux
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    appRoutes,
    BrowserAnimationsModule,
    HttpClientModule,
    CdkTableModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MainTcustomizeModule,
    SimpleNotificationsModule.forRoot(),
    SocketIoModule.forRoot(socketConfig),
    LeafletModule.forRoot(),
    FaucetPageModule,
    InfoPageModule,
    InterrogationModule,
    InfoDialogModule,
    MainPageModule,
    BlockPageModule,
    TokensPageModule,
    AccountCreationPageModule,
    AccountPageModule,
    AddressPageModule,
    ContractsModule,
    FoundationPageModule,
    KeyPairGenerationPageModule,
    TransactionPageModule,
    WalletPageModule,
    VotePageModule,
    P2PageModule,
    ProducersPageModule,
    ProducerModule,
    AnalyticsPageModule,
    RamPageModule,
    SoonModule,
    AdminModule,
    MatSnackBarModule,
    RegistrationPageModule,
  ],
  providers: [ ...providers ],
  bootstrap: [AppComponent]
})
export class AppModule {}



