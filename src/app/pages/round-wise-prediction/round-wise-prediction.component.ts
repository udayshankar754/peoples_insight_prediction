import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LiveResultService } from '../../services/result/live-result.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-round-wise-prediction',
  standalone : true,
  imports: [CommonModule, ReactiveFormsModule, NzSelectModule , NzTableModule],
  host: { ngSkipHydration: 'true' },
  templateUrl: './round-wise-prediction.component.html',
  styleUrl: './round-wise-prediction.component.scss',
})
export class RoundWisePredictionComponent implements OnInit {
  selectLoader: {
    state: boolean;
  } = { state: false };
  states: any;
  formData: FormGroup;
  roundwiseTotalVoter: any;
  roundwiseBiResult: any;
  biResultKeys : any;

  constructor(
    private fb: FormBuilder,
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
  ) {
    this.formData = this.fb.group({
      state: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.fetchStates();

    this.formData.get('state')?.valueChanges.subscribe((value: any) => {
      const state = this.states.find((state: any) => state.value === value);
      if (state) {
        this.fetchRoundWiseTotalVoter(state.value);
        this.fetchRoundWiseBiResult(state.value);
      }
    });
  }

  fetchStates() {
    this.liveResultService.getStateCode().subscribe(
      (data: any) => {
        console.log(data);
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

  fetchRoundWiseTotalVoter(state: any) {
    this.liveResultService.roundwiseTotalVoter(state).subscribe(
      (data: any) => {
        // console.log(data);
        this.roundwiseTotalVoter = data;
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  fetchRoundWiseBiResult(state: any) {
    this.liveResultService.roundwiseBiResult(state).subscribe(
      (data: any) => {
        console.log(data);
        this.roundwiseBiResult = data;
        this.biResultKeys = Object.keys(data[0]);
      },
      (error: any) => {
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }
}
