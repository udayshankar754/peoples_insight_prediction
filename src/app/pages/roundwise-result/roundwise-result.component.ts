import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CircularChart3DAllModule } from '@syncfusion/ej2-angular-charts';
import { LiveResultService } from '../../services/result/live-result.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
@Component({
  selector: 'app-roundwise-result',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    CircularChart3DAllModule,
    NzCardModule,
    RouterModule,
    NzButtonModule,
  ],
  host: { ngSkipHydration: 'true' },
  templateUrl: './roundwise-result.component.html',
  styleUrl: './roundwise-result.component.scss',
})
export class RoundwiseResultComponent implements OnInit, OnDestroy {
  state_code: any;
  ac_no: any;
  round_no: any;
  result: any;
  dataSource: any;
  partyColor: any;
  private queryParamsSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.state_code = params.get('state_code');
      this.ac_no = params.get('ac_no');
    });

    this.queryParamsSubscription = this.route.queryParamMap.subscribe((queryParams) => {
      this.round_no = queryParams.get('round');
      this.getStart();
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  getStart() {
    this.result = [];
    this.dataSource = [];
    this.partyColor = [];
    this.getPartyColor();
    this.stateCode();
  }

  stateCode() {
    this.liveResultService.getStateCode().subscribe(
      (res: any) => {
        if (res && res?.length > 0) {
          let validState = res?.find(
            (i: any) => i?.state_code?.toLowerCase() == this.state_code?.toLowerCase(),
          );
          console.log(this.state_code , res , validState);

          if (validState) {
            this.acListStateWise(validState?.state_code);
          } else {
            this.messageService.error('Invalid State Code');
          }
        }
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch State code List');
      },
    );
  }

  acListStateWise(state_code: any) {
    this.liveResultService.getAcNoList(state_code).subscribe(
      (res: any) => {
        if (res && res?.length > 0) {
          // console.log(res);
          let validAcNo = res?.find(
            (i: any) => i?.AC_NO?.toString()?.toLowerCase() == this.ac_no?.toLowerCase(),
          );
          if (validAcNo) {
            if (this.round_no) {
              this.roundWise(this.round_no);
            } else {
              this.resultData(this.state_code, this.ac_no);
            }
          } else {
            this.messageService.error('Invalid AC No');
          }
        }
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch Ac List');
      },
    );
  }

  roundWise(round: any) {
    this.liveResultService.roundList(this.state_code, this.ac_no).subscribe(
      (res: any) => {
        if (res && res?.length > 0) {
          let validRound = res?.find(
            (i: any) => i?.ROUND?.toString()?.toLowerCase() == round?.toLowerCase(),
          );

          if (validRound) {
            this.resultData(this.state_code, this.ac_no, round);
          } else {
            this.messageService.error('Invalid Round No');
          }
        }
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch Ac List');
      },
    );
  }

  getPartyWiseColorCodes(party: any) {
    let color = this.partyColor?.find(
      (i: any) => i?.PARTY?.toLowerCase() == party?.toLowerCase(),
    )?.CODES;
    return color;
  }

  getPartyColor() {
    this.liveResultService.getPartyColor().subscribe(
      (res: any) => {
        this.partyColor = res?.party_color;
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch party  color result');
      },
    );
  }

  resultData(state_code: any, ac_no: any, round_no?: any) {
    if (round_no) {
      this.liveResultService.roundwiseResult(state_code, ac_no, round_no).subscribe(
        (res: any) => {
          console.log(res);
          if (res && res?.length > 0) {
            let totalVotes = 0;
            let prev_round_votes = 0;
            res?.forEach((element: any) => {totalVotes += element?.votes; prev_round_votes += element?.prevRoundVotes});
            const current_round_votes = totalVotes - prev_round_votes;
            this.result = res?.map((i: any) => {
              const curRoundVotes = Number(i?.votes) - Number(i?.prevRoundVotes || 0);
              return {
                ...i,
                round_wise_vote_share: `${((Number(i?.votes) / Number(totalVotes)) * 100).toFixed(2)}`,
                cur_round_votes: curRoundVotes,
                round_wise_cur_round__vote_share: `${((curRoundVotes / Number(current_round_votes)) * 100).toFixed(2)}`,
              };
            });
            
            this.dataSource = this.result?.map((i: any) => {
              return {
                x: i?.party_alice,
                y: Number(i?.round_wise_vote_share?.split(' ')[0]),
                fill: this.getPartyWiseColorCodes(i?.party_alice),
                text: i?.party_alice,
              };
            });
          } else {
            this.messageService.info('No Result Found');
          }
        },
        (err: any) => {
          console.error(err);
          this.messageService.error('Failed to fetch Round wise List');
        },
      );
    } else {
      this.liveResultService.acwiseResult(state_code, ac_no).subscribe(
        (res: any) => {
          if (res && res?.length > 0) {
            let uniqueRound = [...new Set(res?.map((i: any) => i?.ROUND))];

            this.result = uniqueRound
              .map((round: any) => {
                let data = res?.filter((i: any) => i?.ROUND == round);
                let totalVotes = 0;
                data?.forEach((element: any) => (totalVotes += element?.votes));

                let response = data?.map((i: any) => {
                  return {
                    ...i,
                    round_wise_vote_share: `${(
                      (Number(i?.votes) / Number(totalVotes)) *
                      100
                    )?.toFixed(2)}`,
                  };
                });

                let dataSource = response?.map((i: any) => {
                  return {
                    x: i?.party_alice,
                    y: Number(i?.round_wise_vote_share?.split(' ')[0]),
                    fill: this.getPartyWiseColorCodes(i?.party_alice),
                    text: i?.party_alice,
                  };
                });

                return {
                  round,
                  response,
                  dataSource,
                };
              })
              .sort((a, b) => a.round - b.round);
          } else {
            this.messageService.info('No Result Found');
          }
        },
        (err: any) => {
          console.error(err);
          this.messageService.error('Failed to fetch Ac wise List');
        },
      );
    }
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
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

  roundWiseDetails(round: any) {
    this.router.navigate(['/roundwise-result', this.state_code, this.ac_no], {
      queryParams: { round: round },
    });
  }

  getTotalVotes(data : any , key : string) {
    let totalVotes = 0
    data?.forEach((i: any) => totalVotes += Number(i?.[key] || 0))
    return totalVotes;    
  }
}
