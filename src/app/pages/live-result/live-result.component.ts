import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CircularChart3DAllModule } from '@syncfusion/ej2-angular-charts';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LiveResultService } from '../../services/result/live-result.service';
import { ResultMapComponent } from '../result-map/result-map.component';
import { NzCardModule } from 'ng-zorro-antd/card';
@Component({
  selector: 'app-live-result',
  standalone: true,
  imports: [
    NzTableModule,
    CommonModule,
    NzButtonModule,
    CircularChart3DAllModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule,
    ResultMapComponent,
    NzCardModule,
  ],
  host: { ngSkipHydration: 'true' },
  templateUrl: './live-result.component.html',
  styleUrl: './live-result.component.scss',
})
export class LiveResultComponent implements OnInit, OnDestroy {
  resultData: any;
  partyColorBi: any;
  partyColor: any;
  conclusion: any;
  partyVote: any;
  formData: any;
  states: any;
  electionType: any = [{ label: 'Assembly Election', value: 'assembly_election' }];
  public dataSource: any;
  dataSource_2: any;
  selectedStateName: any;
  data = new BehaviorSubject<any>(null);
  private pollingSubscription: any;

  constructor(
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.formData = this.fb.group({
      state: ['DL', [Validators.required]],
      electionType: ['', [Validators.required]],
    });
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.getResultData();
    this.getPartyBiColorResult();
    this.getPartyColor();
    this.getPartyVotes();
    this.selectedStateName = {
      state: 'Delhi',
      state_code: 'DL',
    };
    if (this.isBrowser()) {
      this.getUpdatedData();
    }
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
    // The stopPolling() method in the service will handle the subject cleanup
  }

  getResultData() {
    this.liveResultService.getLiveResult().subscribe(
      (res: any) => {
        // console.log(res);
        this.resultData = res;
        this.getConclusionData();
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch live result');
      },
    );
  }

  getPartyBiColorResult() {
    this.liveResultService.getPartyColorBi().subscribe(
      (res: any) => {
        this.partyColorBi = res?.party_color;
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch party bi result');
      },
    );
  }

  getPartyColor() {
    this.liveResultService.getPartyColor().subscribe(
      (res: any) => {
        // console.log(res);
        this.partyColor = res?.party_color;
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch party  color result');
      },
    );
  }

  getPartyVotes() {
    this.liveResultService.getVotes().subscribe(
      (res: any) => {
        this.partyVote = res;
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch party  votes result');
      },
    );
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

    return `background-color : ${colorCodes}; color: white ; font-weight: bold; font-size: 26px;`;
  }

  getDynamicHeaderData(pData: any, compData: any) {
    if (this.resultData) {
      let uniqueParty = [
        ...new Set([
          ...this.resultData?.map((row: any) => row[pData]?.split(' ')[0]),
          ...this.resultData?.map((row: any) => row[compData]?.split(' ')[0]),
        ]),
      ]?.filter((i) => i !== undefined);

      let partyWiseData = uniqueParty?.map((party: any) => {
        let correct = this.resultData
          ?.filter((row: any) => row[pData]?.split(' ')[0] == row[compData]?.split(' ')[0])
          ?.filter((row: any) => row[pData]?.split(' ')[0] == party)?.length;
        let incorrect = this.resultData
          ?.filter((row: any) => row[pData]?.split(' ')[0] != row[compData]?.split(' ')[0])
          ?.filter((row: any) => row[pData]?.split(' ')[0] == party)?.length;
        return { party, correct, incorrect };
      });

      let htmlContent = ``;

      // Add party-wise data
      htmlContent += partyWiseData
        ?.map((item) => {
          let color = this.getPartyWiseColorCodes(item?.party);
          return `
            <div style="background-color:${color}; color : white; text-align : center; font-weight: bold;" >${
              item.party
            } : ${item.correct} / ${item.correct + item.incorrect}</div>
          `;
        })
        .join(''); // Join all the party-wise results with line breaks

      // Add the total at the bottom
      htmlContent += `
        <div>Total : ${
          this.resultData?.filter(
            (row: any) => row[pData]?.split(' ')[0] == row[compData]?.split(' ')[0],
          )?.length
        } / ${this.resultData?.length}</div>
      `;

      return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
    }
    return null;
  }

  getPartyWiseColorCodes(party: any) {
    let color =
      this.partyColor?.find((i: any) => i?.PARTY?.toLowerCase() == party?.toLowerCase())?.CODES ||
      '#ccc';
    return color;
  }

  getPrtyWiseBackround(party: any) {
    let color =
      this.partyColor?.find((i: any) => i?.PARTY?.toLowerCase() == party?.toLowerCase())?.CODES ||
      '#ccc';
    return `background-color : ${color}; color: white ; font-weight: bold; font-size: 26px;`;
  }

  getPartyColor_res(party: any) {
    const winnerParty = party?.split(' ')[0]?.toLowerCase();
    let color =
      this.partyColor?.find((i: any) => i?.PARTY?.toLowerCase() == winnerParty)?.CODES || '#ccc';
    return `background-color: ${color} ; color : white;`;
  }

  getConclusionData() {
    let incWonSheet = this.resultData?.filter(
      (row: any) => row?.RESULT_25?.split(' ')[0] == 'INC',
    )?.length;
    let bjpWonSheet = this.resultData?.filter(
      (row: any) => row?.RESULT_25?.split(' ')[0] == 'BJP',
    )?.length;
    let aapWonSheet = this.resultData?.filter(
      (row: any) => row?.RESULT_25?.split(' ')[0] == 'AAP',
    )?.length;

    let incActualSheet = this.resultData?.filter(
      (row: any) => row?.LL?.split(' ')[0] == 'INC',
    )?.length;
    let bjpActualSheet = this.resultData?.filter(
      (row: any) => row?.LL?.split(' ')[0] == 'BJP',
    )?.length;
    let aapActualSheet = this.resultData?.filter(
      (row: any) => row?.LL?.split(' ')[0] == 'AAP',
    )?.length;

    let incLLCount = 1;
    let bjpLLCount = 42;
    let aapLLCount = 27;

    let incPredection = incLLCount + incWonSheet - incActualSheet;
    let bjpPredection = bjpLLCount + bjpWonSheet - bjpActualSheet;
    let aapPredection = aapLLCount + aapWonSheet - aapActualSheet;

    let totalVotes = 0;
    this.partyVote?.forEach((votes: any) => (totalVotes += votes?.VOTES));

    let bjpActualVoteShare = `${(
      ((this.partyVote?.find((party: any) => party.party === 'Bharatiya Janata Party')?.VOTES ||
        0) /
        totalVotes) *
      100
    )?.toFixed(2)} %`;
    let aapActualVoteShare = `${(
      ((this.partyVote?.find((party: any) => party.party === 'Aam Aadmi Party')?.VOTES || 0) /
        totalVotes) *
      100
    )?.toFixed(2)} %`;
    let incActualVoteShare = `${(
      ((this.partyVote?.find((party: any) => party.party === 'Indian National Congress')?.VOTES ||
        0) /
        totalVotes) *
      100
    )?.toFixed(2)} %`;

    let bjpPrecVoteshare = '46.04 %';
    let aapPrecVoteshare = '38.12 %';
    let incPrecVoteshare = '6.66 %';
    let othervotes = 0;

    this.partyVote?.map((party: any) => {
      if (
        party.party !== 'Bharatiya Janata Party' &&
        party.party !== 'Aam Aadmi Party' &&
        party.party !== 'Indian National Congress'
      ) {
        othervotes += party?.VOTES;
      }
    });
    let othersVoteShare = ((othervotes / totalVotes) * 100).toFixed(2);
    let othersPredictedVoteShare = (
      100 -
      (Number(bjpActualVoteShare?.split(' ')[0]) +
        Number(aapActualVoteShare?.split(' ')[0]) +
        Number(incActualVoteShare?.split(' ')[0]))
    )?.toFixed(2);

    this.dataSource_2 = [
      {
        x: 'BJP',
        y: Number(bjpPrecVoteshare?.split(' ')[0]),
        fill: this.getPartyWiseColorCodes('BJP'),
        text: 'BJP',
      },
      {
        x: 'AAP',
        y: Number(aapPrecVoteshare?.split(' ')[0]),
        fill: this.getPartyWiseColorCodes('AAP'),
        text: 'AAP',
      },
      {
        x: 'INC',
        y: Number(incPrecVoteshare?.split(' ')[0]),
        fill: this.getPartyWiseColorCodes('INC'),
        text: 'INC',
      },
      {
        x: 'OTHERS',
        y: Number(othersPredictedVoteShare),
        fill: this.getPartyWiseColorCodes('OTHERS'),
        text: 'OTHERS',
      },
    ];

    this.dataSource = [
      {
        x: 'BJP',
        y: Number(bjpActualVoteShare?.split(' ')[0]),
        fill: this.getPartyWiseColorCodes('BJP'),
        text: 'BJP',
      },
      {
        x: 'AAP',
        y: Number(aapActualVoteShare?.split(' ')[0]),
        fill: this.getPartyWiseColorCodes('AAP'),
        text: 'AAP',
      },
      {
        x: 'INC',
        y: Number(incActualVoteShare?.split(' ')[0]),
        fill: this.getPartyWiseColorCodes('INC'),
        text: 'INC',
      },
      {
        x: 'OTHERS',
        y: Number(othersVoteShare),
        fill: this.getPartyWiseColorCodes('OTHERS'),
        text: 'OTHERS',
      },
    ];

    this.conclusion = [
      {
        party: 'BJP',
        actualResult: bjpWonSheet,
        expectedResult: bjpActualSheet,
        Predection: bjpPredection,
        actualVoteShare: bjpActualVoteShare,
        precVoteShare: bjpPrecVoteshare,
      },
      {
        party: 'AAP',
        actualResult: aapWonSheet,
        expectedResult: aapActualSheet,
        Predection: aapPredection,
        actualVoteShare: aapActualVoteShare,
        precVoteShare: aapPrecVoteshare,
      },
      {
        party: 'INC',
        actualResult: incWonSheet,
        expectedResult: incActualSheet,
        Predection: incPredection,
        actualVoteShare: incActualVoteShare,
        precVoteShare: incPrecVoteshare,
      },
    ];
  }

  removeLabel() {
    if (this.isBrowser()) {
      // Select the banner based on the style and content
      const banners = document.querySelectorAll(
        'div[style*="position: fixed"][style*="top: 10px"][style*="left: 10px"][style*="right: 10px"]',
      );

      banners.forEach((banner) => {
        // Check if the banner contains the specific text content
        if (
          banner.textContent &&
          banner.textContent.includes(
            'This application was built using a trial version of Syncfusion',
          )
        ) {
          if (banner.parentNode) {
            this.renderer.removeChild(banner.parentNode, banner);
          }
        }
      });

      // Select the overlay element and remove it if found
      const overlay = document.querySelector(
        'div[style*="position: fixed"][style*="top: 0"][style*="left: 0"][style*="right: 0"][style*="bottom: 0"][style*="background-color: rgba(0, 0, 0, 0.5)"]',
      );
      if (overlay && overlay.parentNode) {
        this.renderer.removeChild(overlay.parentNode, overlay);
      }
    }
  }

  fetchStates() {
    // this.httpClient
    //   .get<any[]>(`${environment.baseUrl}constituency/state`)
    //   .subscribe(
    //     (data : any) => {
    //       this.states = data.map((state : any) => ({
    //         label: (state?.State_Name)?.replaceAll("_", " "),
    //         value: state?.State_Name,
    //       }));
    //       console.log(this.states);
    //     },
    //     (error : any) => {
    //       console.error('Error fetching states:', error);
    //       this.messageService.error('Failed to fetch states. Please try again later.');
    //     }
    //   );
    this.states = [{ label: 'Delhi', value: 'DL' }];
  }
  onStateChange() {
    this.getResultData();
    this.getPartyBiColorResult();
    this.getPartyColor();
    this.getPartyVotes();
    this.selectedStateName = {
      state: this.formData.get('state')?.value == 'DL' ? 'Delhi' : '',
      state_code: this.formData.get('state')?.value,
    };
    this.getUpdatedData();
  }

  onElectionTypeChange() {
    if (this.formData.get('electionType')?.value == 'assembly_election') {
      this.fetchStates();
    } else {
      this.states = [];
      this.messageService.info('Data Not Found');
    }
  }
  acWiseDetails(ac: any) {
    let state_code = this.formData.get('state')?.value;
    this.router.navigate(['/roundwise-result', state_code, ac]);
  }
  getUpdatedData() {
    // this.liveResultService.startPolling(10000).subscribe((data : any) => {
    //   this.getConclusionData();
    //   this.selectedStateName =   {
    //     ...this.selectedStateName,
    //    reload : true
    //   }
    //   this.resultData = data;
    // })
  }

  receiveData(data: any) {
    // Replace 'any' with the specific data type
    // this.receivedData = data;/
    console.log('Received data from child:', data);
  }
}
