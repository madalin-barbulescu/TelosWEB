import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './pages/main_page/main_page.component';
import { BlockPageComponent } from './pages/block/block.component';
import { FaucetPageComponent } from './pages/faucet/faucet.component';
import { InfoPageComponent } from './pages/info/info.component';
import { TransactionPageComponent } from './pages/transactions/transactions.component';
import { AccountPageComponent } from './pages/account/account.component';
import { AccountCreationPageComponent } from './pages/account-creation/account-creation.component';
import { AddressPageComponent } from './pages/address/address.component';
import { P2PageComponent } from './pages/p2p/p2p.component';
import { ProducersPageComponent } from './pages/producers/producers.component';
import { ProducerComponent } from './pages/producer_page/producer_page.component';
import { AnalyticsPageComponent } from './pages/analytics/analytics.component';
import { TokensPageComponent } from './pages/tokens/tokens.component';
import { RamPageComponent } from './pages/ram/ram.component';
import { SoonComponent } from './pages/soon/soon.component';
import { WalletPageComponent } from './pages/wallet/wallet.component';
import { VotePageComponent } from './pages/vote/vote.component';
import { AdminComponent } from './pages/admin/admin.component';
import { RegistrationPageComponent } from './pages/registration/registration.component';
//import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { 
  	path: '', 
  	component: MainPageComponent, 
  	pathMatch: 'full' 
  },
   { 
  	path: 'block/:id', 
  	component: BlockPageComponent 
  },
  { 
    path: 'faucet', 
    component: FaucetPageComponent
  },
  { 
    path: 'info', 
    component: InfoPageComponent 
  },
  { 
    path: 'account/:id', 
    component: AccountPageComponent 
  },
  {
    path: 'account-creation', 
    component: AccountCreationPageComponent 
  },
  { 
    path: 'address/:id', 
    component: AddressPageComponent 
  },
  { 
    path: 'p2p', 
    component: P2PageComponent 
  },
  { 
    path: 'producers', 
    component: ProducersPageComponent 
  },
  { 
    path: 'producer/:id', 
    component: ProducerComponent 
  },
  { 
    path: 'analytics', 
    component: AnalyticsPageComponent 
  },
  { 
    path: 'accounts', 
    component: AnalyticsPageComponent 
  },
  {
    path: 'ram', 
    component: RamPageComponent 
  },
  {
    path: 'registration', 
    component: RegistrationPageComponent 
  },
  { 
    path: 'transaction/:id', 
    component: TransactionPageComponent 
  },
  { 
    path: 'wallet', 
    component: WalletPageComponent 
  },
  { 
    path: 'vote', 
    component: VotePageComponent 
  },
  { 
    path: 'tokens', 
    component: TokensPageComponent 
  },
  { 
    path: 'settings', 
    component: AdminComponent 
  },
  { 
    path: 'notfound', 
    component: SoonComponent 
  },
  { path: '**', redirectTo: '' },
]

export const appRoutingProviders: any[] = [
	//AuthGuard
];

export const appRoutes = RouterModule.forRoot(routes);