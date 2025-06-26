import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { LiveResultService } from '../../services/result/live-result.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-roundwise-analysis',
  standalone: true,
  imports: [NzTableModule, CommonModule, NzSelectModule, FormsModule, NzCardModule, NzSpinModule],
  templateUrl: './roundwise-analysis.component.html',
  styleUrl: './roundwise-analysis.component.scss',
  host: { ngSkipHydration: 'true' },
})
export class RoundwiseAnalysisComponent implements OnInit {
  resultData: any;
  maxRounds: any;
  partyColorBi: any;
  selectedOption: any = 'EP_24';
  optionData: any = [
    { label: 'EP_24', value: 'EP_24' },
    { label: 'PAM_EP', value: 'PAM_EP' },
    { label: 'G50_NORM', value: 'G50_NORM' },
    { label: 'EP_NORM', value: 'EP_NORM' },
    { label: 'PEP', value: 'PEP' },
    { label: 'PP_24', value: 'PP_24' },
    { label: 'COM', value: 'COM' },
    { label: 'PAM_PP', value: 'PAM_PP' },
    { label: 'PP_NORM', value: 'PP_NORM' },
    { label: 'BC_NORM', value: 'BC_NORM' },
    { label: 'BC_2', value: 'BC_2' },
    { label: 'BC_1', value: 'BC_1' },
    { label: 'BC_COM', value: 'BC_COM' },
    { label: 'LSE24', value: 'LSE24' },
    { label: 'LSE_EP_24', value: 'LSE_EP_24' },
    { label: 'LSE_PP_24', value: 'LSE_PP_24' },
    { label: 'LSE_BC_24', value: 'LSE_BC_24' },
    { label: 'MCD_22', value: 'MCD_22' },
    { label: 'VSE20', value: 'VSE20' },
    { label: 'VSE15', value: 'VSE15' },
  ];
  isLoading: boolean = false;
  paramsData: {
    state: string | null;
    state_code: string | null;
  } = {
    state: null,
    state_code: null,
  };

  constructor(
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
    private sanitizer: DomSanitizer,
    private activeRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.activeRoute.paramMap.subscribe((params) => {
      this.paramsData.state = params.get('state');
      this.paramsData.state_code = params.get('state_code');
    });
    this.getPartyBiColorResult();

  }

  roundWiseData() {
    // this.selectedStateName = {
    //   state: state?.label,
    //   state_code: state?.value,
    // };
    this.liveResultService.roundWiseReport(this.paramsData.state , this.paramsData.state_code).subscribe(
      (res: any) => {
        // console.log(res);
        this.resultData = res;
        this.maxRounds = new Array(this.resultData?.maxRound).fill(0);
        this.isLoading = false;
      },
      (err: any) => {
        this.isLoading = false;
        console.error(err);
        this.messageService.error('Failed to fetch Round wise Report');
      },
    );
  }

  getPartyBiColorResult() {
    this.liveResultService.getPartyColorBi().subscribe(
      (res: any) => {
        this.partyColorBi = res?.party_color;
        this.roundWiseData();
      },
      (err: any) => {
        this.isLoading = false;
        console.error(err);
        this.messageService.error('Failed to fetch party bi result');
      },
    );
  }

  getAcNo(data: any): any[] {
    return [...new Set(data?.map((i: any) => i?.AC_NO))];
  }

  getData(dataField: any, requiredField: any, round?: any) {
    if (this.resultData) {
      if (round) {
        let rec = this.resultData?.roundWiseResult?.find(
          (i: any) => i?.AC_NO == `${dataField}` && i?.ROUND == `${round}`,
        )?.[`${requiredField}`];
        // console.log(this.resultData , dataField , requiredField ,round,  rec);
        return rec || '-';
      } else {
        let rec = this.resultData?.roundWiseResult?.find((i: any) => i?.AC_NO == `${dataField}`)?.[
          `${requiredField}`
        ];
        return rec || '-';
      }
    }
    return null;
  }

  getStyling(data: any) {
    let colorCodes;

    if (data) {
      const winnerParty = data?.split(' ')[0];
      const winnerPercentage = data?.split(' ')[1]?.includes('%')
        ? data.split(' ')[1].split('%')[0]
        : data.split(' ')[1];

      if (this.partyColorBi) {
        if (winnerPercentage < 5.0) {
          let gradcodes = this.partyColorBi?.filter(
            (item: any) => item?.PARTY_NAME == winnerParty && item?.WIN_GROUP == '5',
          );
          colorCodes = gradcodes[0]?.COLORS;
        } else if (winnerPercentage < 10.0) {
          let gradcodes = this.partyColorBi?.filter(
            (item: any) => item?.PARTY_NAME == winnerParty && item?.WIN_GROUP == '10',
          );
          colorCodes = gradcodes[0]?.COLORS;
        } else if (winnerPercentage < 15.0) {
          let gradcodes = this.partyColorBi?.filter(
            (item: any) => item?.PARTY_NAME == winnerParty && item?.WIN_GROUP == '15',
          );
          colorCodes = gradcodes[0]?.COLORS;
        } else if (winnerPercentage < 20.0) {
          let gradcodes = this.partyColorBi?.filter(
            (item: any) => item?.PARTY_NAME == winnerParty && item?.WIN_GROUP == '20',
          );
          colorCodes = gradcodes[0]?.COLORS;
        } else if (winnerPercentage < 30.0) {
          let gradcodes = this.partyColorBi?.filter(
            (item: any) => item?.PARTY_NAME == winnerParty && item?.WIN_GROUP == '30',
          );
          colorCodes = gradcodes[0]?.COLORS;
        } else {
          let gradcodes = this.partyColorBi?.filter(
            (item: any) => item?.PARTY_NAME == winnerParty && item?.WIN_GROUP == 31,
          );
          colorCodes = gradcodes[0]?.COLORS;
        }
      } else {
        this.messageService.create('error', 'Uanble to get Party color codes');
      }
    }

    return `background-color : ${
      colorCodes || '#ccc'
    }; color: white ; font-weight: bold; font-size: 26px;`;
  }

  dataFormat(data: any) {
    if (data === null || data === undefined || data === '-') {
      return '-';
    }

    if (typeof data === 'string') {
      return data?.split(' ')[0];
    }

    return data;
  }

  calculateScrollWidth(): string {
    const baseWidth = 230; // AC_NO (80px) + AC_NAME (150px)
    const roundWidth = 200; // Prediction + Actual (100px each)
    return `${baseWidth + this.maxRounds.length * roundWidth}px`;
  }
}
