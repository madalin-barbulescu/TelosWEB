import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class FoundationService {
  private _store$: BehaviorSubject<any>;

  constructor() {
    this._store$ = new BehaviorSubject(this._init());
  }

  get store$ () {
    return this._store$;
  }

  getData(path: string) {
    return this._store$
      .map((store) => {
        const slices = path.split('.');
        let i, slice, output = store;

        for(i = 0; i < slices.length; i += 1) {
          slice = slices[i];
          output = output[slice];
        }

        return output;
      })
      .distinctUntilChanged();
  }

  updateAddIssue(issue: any = {}) {
    const issues = this.store$.getValue().issues;
    issues.push(issue);
    this._updateStore({ issues });
  }

  updateConfig(config: any = {}) {
    this._updateStore({ config });
  }

  updateBoardMembers(boardMembers: any[] = []) {
    this._updateStore({ boardMembers });
  }

  updateElection(election: any = {}) {
    this._updateStore({ election });

    const store = this.store$.value;
    this.updateElectionList(store.nominees, election.candidates);
  }

  updateNominees(nominees: any[] = []) {
    this._updateStore({ nominees });

    const store = this.store$.value;
    this.updateElectionList(nominees, store.election.candidates);
  }

  updateAddNominee(nominee: any = {}) {
    const nominees = this.store$.getValue().nominees;
    nominees.push(nominee);
    this._updateStore({ nominees });
  }

  updateIssues(issues: any[] = []) {
    this._updateStore({ issues });
  }

  updateIsLoading(isLoading: boolean) {
    this._updateStore({ isLoading });
  }

  updateBalance(balance) {
    this._updateStore({ balance })
  }

  updateElectionList(nominees = [], candidates = []) {
    let listMap = {};
    const { election } = this.store$.value;
    const now = Date.now() / 1000;

    if (now <= election.begin_time || election.status > 0)
      nominees.forEach((nominee) => {
        listMap[nominee.nominee] = {
          type: 'nominee',
          member: nominee.nominee
        };
      });

    if (election.status === 0)
      candidates.forEach((candidate, index) => {
        listMap[candidate.member] = Object.assign({type: 'candidate', index}, candidate);
      });

    let electionList = Object.keys(listMap).map((key) => listMap[key]);

    this._updateStore({ electionList });
  }

  private _init() {
    return {
      balance: 0,
      boardMembers: [],
      config: {},
      election: {},
      electionList: [],
      isLoading: false,
      nominees: [],
      issues: []
    }
  }

  private _updateStore(object) {
    let store = this.store$.getValue();
    store = Object.assign(store, object);

    this.store$.next(store);
  }
}