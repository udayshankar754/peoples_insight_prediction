import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LiveResultService } from '../../services/result/live-result.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { interval, startWith, Subscription, switchMap } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-round-wise-prediction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzSelectModule, NzTableModule , NzCardModule],
  host: { ngSkipHydration: 'true' },
  templateUrl: './round-wise-prediction.component.html',
  styleUrl: './round-wise-prediction.component.scss',
})
export class RoundWisePredictionComponent implements OnInit, OnDestroy {
  selectLoader: {
    state: boolean;
    ac_no: boolean;
  } = { state: false, ac_no: false };
  states: any = [];
  formData: FormGroup;
  roundwiseTotalVoter: any = [];
  roundwiseBiResult: any = [];
  biResultKeys: any = [];
  turnout: any = [];
  liveResultData: any = [];
  partyColor: any = [];
  ac_list: any = [];
  subscription: Subscription | undefined;
  startCalling: boolean = false;
  biResult: any = [];
  tableSummary : string = '';

  constructor(
    private fb: FormBuilder,
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
  ) {
    this.formData = this.fb.group({
      state: ['', [Validators.required]],
      ac_no: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.fetchStates();

    this.formData.get('state')?.valueChanges.subscribe((value: any) => {
      this.reset('state');
      const state = this.states.find((state: any) => state.value === value);
      if (state) {
        this.fetchAcNO(state.value);
      }
    });
    this.formData.get('ac_no')?.valueChanges.subscribe((value: any) => {
      this.reset('ac_no');
      if (value) {
        this.fetchPartyColor();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  startPolling() {
    if (this.startCalling) {
      // TODO: Increase Time Delay For Polling this.
      this.subscription = interval(600)
        .pipe(
          startWith(0),
          switchMap(() =>
            this.liveResultService.roundwiseLiveResult(
              this.formData.get('state')?.value,
              this.formData.get('ac_no')?.value,
            ),
          ),
        )
        .subscribe(
          (data: any) => {
            this.liveResultData = data;
            this.getFormattedData();
          },
          (error) => {
            console.error('Error fetching states:', error);
            this.messageService.error('Failed to fetch states. Please try again later.');
          },
        );
    }
  }

  fetchStates() {
    this.liveResultService.getStateCode().subscribe(
      (data: any) => {
        this.states = data.map((state: any) => ({
          label: state?.state,
          value: state?.state_code,
        }));
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  fetchAcNO(state: string) {
    this.liveResultService.getAcNoList(state).subscribe(
      (data: any) => {
        this.ac_list = data.map((state: any) => ({
          label: state?.AC_NO,
          value: state?.AC_NO,
        }));
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  fetchPartyColor() {
    this.liveResultService.getPartyColor().subscribe(
      (data: any) => {
        this.partyColor = data?.party_color;
        this.fetchRoundWiseTotalVoter(this.formData.get('state')?.value);
      },
      (error: any) => {
        console.error('Error fetching party color:', error);
        this.messageService.error('Failed to fetch party color. Please try again later.');
      },
    );
  }

  fetchRoundWiseTotalVoter(state: any) {
    this.liveResultService.roundwiseTotalVoter(state).subscribe(
      (data: any) => {
        // console.log(data);
        this.roundwiseTotalVoter = data;
        this.fetchStateWiseTurnout(state);
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  fetchStateWiseTurnout(state: any) {
    this.liveResultService.stateWiseTurnout(state).subscribe(
      (data: any) => {
        this.turnout = data;
        this.fetchRoundWiseBiResult(state);
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  fetchRoundWiseResult(state: any, ac_no: any) {
    this.liveResultService.roundwiseLiveResult(state, ac_no).subscribe(
      (data: any) => {
        // console.log(data);
        this.liveResultData = data;
        this.getFormattedData();
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  fetchRoundWiseBiResult(state: any) {
    this.liveResultService.roundwiseBiResult(state, this.formData.get('ac_no')?.value).subscribe(
      (data: any) => {
        this.biResult = data;
                // this.fetchRoundWiseResult(state, this.formData.get('ac_no')?.value);
                this.startCalling = true;
                this.startPolling();
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  getFormattedData() {
    this.tableSummary = `Current Round : ${this.liveResultData.map((liveresult: any) => liveresult?.ROUND)?.sort((a : any,b : any) => b - a)[0]}`;
    const itemsToRemove = ['STATE', 'AC_NO', 'ROUND'];
    const parties = Object.keys(this.biResult[0]).filter((item) => !itemsToRemove.includes(item));

    this.roundwiseBiResult = this.biResult.map((i: any) => {
      const total_votes = this.roundwiseTotalVoter?.find(
        (j: any) => j?.AC_NO == i?.AC_NO && j?.ROUND_NO == i?.ROUND,
      )?.TOTAL_VOTERS;

      const turnout_percentage = this.turnout.find((k: any) => k?.AC_NO == i?.AC_NO)?.AC_TURNOUT;
      const turnout_votes = Math.round((turnout_percentage / 100) * total_votes);
      const totalVoters = this.liveResultData
        .filter((liveresult: any) => liveresult?.ac_no == i?.AC_NO && liveresult?.ROUND == i?.ROUND)
        .map((liveresult: any) => liveresult?.votes)
        .reduce((a: any, b: any) => a + b, 0);

      const result: any = {
        STATE: i.STATE,
        AC_NO: i.AC_NO,
        ROUND: i.ROUND,
        TOTAL_VOTERS: total_votes,
        ['TURNOUT_VOTES (' + turnout_percentage + ')']: turnout_votes,
        ['TOTAL_Acc_Votes'] : totalVoters
      };


      // Append bi-party vote counts
      parties.forEach((party: string) => {
        const partyVotes = Math.round((i?.[party] / 100) * turnout_votes);
        result[party] = partyVotes;
      });

      const maxVotesBi = Math.max(...parties.map((party: string) => result[party]));
      const maxVoteParty = parties.find((party: string) => result[party] === maxVotesBi);
      const secondMaxVotesBi = Math.max(
        ...parties
          .filter((party: string) => result[party] !== maxVotesBi && result[party] !== undefined)
          .map((party: string) => result[party]),
      );
      result['__isBiMaxParty'] = maxVoteParty;
      result['__isBiMaxColor'] = this.getPartyWiseColorCodes(maxVoteParty);
      result['Margin'] = maxVotesBi - secondMaxVotesBi;

      

      // Actual party vote counts
      parties.forEach((party: string) => {
        const voteRecord = this.liveResultData.find(
          (liveresult: any) =>
            liveresult?.ac_no == i?.AC_NO &&
            liveresult?.ROUND == i?.ROUND &&
            liveresult?.party == party,
        );
        const votes = voteRecord
          ? Math.round((turnout_votes / 100) * ((voteRecord?.votes / totalVoters) * 100))
          : Math.round((i?.[party] / 100) * turnout_votes);
        result['Acc_' + party] = votes || 0;
      });

      const otherVotes = this.liveResultData
        .filter((liveresult: any) => liveresult?.ac_no == i?.AC_NO && liveresult?.ROUND == i?.ROUND)
        .filter((item: any) => !parties.includes(item?.party))
        .map((liveresult: any) => liveresult?.votes)
        .reduce((a: any, b: any) => a + b, 0);

      const other_actual_votes = Math.round(
        (turnout_votes / 100) * ((otherVotes / totalVoters) * 100),
      );
      result['Acc_OTHERS'] =
        other_actual_votes || Math.round((i?.['OTHERS'] / 100) * turnout_votes);

      const maxVotesActual = Math.max(...parties.map((party: string) => result['Acc_' + party]));
      const maxVoteActualParty = parties.find(
        (party: string) => result['Acc_' + party] === maxVotesActual,
      );

      const secondMaxVotesActual = Math.max(
        ...parties
          .filter(
            (party: string) =>
              result['Acc_' + party] !== maxVotesActual && result['Acc_' + party] !== undefined,
          )
          .map((party: string) => result['Acc_' + party]),
      );
      result['__isActualMaxParty'] = 'Acc_' + maxVoteActualParty;
      result['__isActualMaxColor'] = this.getPartyWiseColorCodes(maxVoteActualParty);

      result['Acc_Margin'] = maxVotesActual - secondMaxVotesActual;

      return result;
    });

    // Set keys to display columns
    this.biResultKeys = Object.keys(this.roundwiseBiResult[0]).filter(
      (key) => !key.startsWith('__'),
    );
    // ➕ Add Total Row
    const totalRow: any = {};
    const excludedKeys = ['STATE', 'AC_NO', 'ROUND', 'Margin', 'Acc_Margin'];
    this.biResultKeys.forEach((key: string) => {
      if (excludedKeys.includes(key)) {
        if (key == 'Margin' || key == 'Acc_Margin') {
          const partyWiseVotes = parties.map((party: string) => {
            let findingKey = key == 'Margin' ? party : 'Acc_' + party;
            const sum = this.roundwiseBiResult
              .map((r: any) => Number(r[findingKey]) || 0)
              .reduce((a: number, b: number) => a + b, 0);
            return { party, votes: sum };
          });

          // Step 1: Extract all vote counts
          let votes = partyWiseVotes.map((item) => item.votes);

          // Step 2: Sort in descending order
          votes.sort((a, b) => b - a);

          // Step 3: Compute the difference between max and second max
          totalRow[key] = votes[0] - votes[1];
        } else {
          totalRow[key] = 'Total';
        }
      } else {
        const sum = this.roundwiseBiResult
          .map((r: any) => Number(r[key]) || 0)
          .reduce((a: number, b: number) => a + b, 0);
        totalRow[key] = sum;
      }
    });

    totalRow.__isTotal = true;
    this.roundwiseBiResult.push(totalRow);
  }

  getPartyWiseColorCodes(party: any) {
    let color =
      this.partyColor?.find((i: any) => i?.PARTY?.toLowerCase() == party?.toLowerCase())?.CODES ||
      '#ccc';
    return color;
  }

  reset(cotrol: string) {
    switch (cotrol) {
      case 'state':
        this.formData.get('ac_no')?.reset();
        this.roundwiseTotalVoter = [];
        this.roundwiseBiResult = [];
        this.biResultKeys = [];
        this.turnout = [];
        this.liveResultData = [];
        this.partyColor = [];
        this.ac_list = [];
        this.biResult = [];
        break;
      case 'ac_no':
        this.roundwiseTotalVoter = [];
        this.roundwiseBiResult = [];
        this.biResultKeys = [];
        this.turnout = [];
        this.liveResultData = [];
        this.partyColor = [];
        this.biResult = [];
        break;
    }
  }
}
