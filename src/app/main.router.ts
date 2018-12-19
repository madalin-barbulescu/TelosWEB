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
import { KeyPairGenerationPageComponent } from './pages/key_pair_generation/key_pair_generation.component';
import { TokensPageComponent } from './pages/tokens/tokens.component';
import { RamPageComponent } from './pages/ram/ram.component';
import { SoonComponent } from './pages/soon/soon.component';
import { WalletPageComponent } from './pages/wallet/wallet.component';
import { VotePageComponent } from './pages/vote/vote.component';
import { AdminComponent } from './pages/admin/admin.component';
import { RegistrationPageComponent } from './pages/registration/registration.component';
import { P2PageManagementComponent } from './pages/admin/p2p-management/p2p-management.component';
import { P2PageEditComponent } from './pages/admin/p2p-edit/p2p-edit.component';
import { ContractsPageComponent } from './pages/contracts/contracts.component';
//import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { 
  	path: '',
  	component: ProducersPageComponent,
  	pathMatch: 'full' 
  },
  {
    path: 'compliance',
    component: InfoPageComponent
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
    component: MainPageComponent
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
    path: 'keys',
    component: KeyPairGenerationPageComponent
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
  }, {
    path: 'contracts',
    component: ContractsPageComponent
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
    children: [
      { path: '', redirectTo: 'admin', pathMatch: 'full' },
      { path: 'admin', component: AdminComponent },
      { path: 'p2p-management', component: P2PageManagementComponent },
      { path: 'p2p-edit/:name', component: P2PageEditComponent }
    ]
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