// maps.component.ts
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  DataLabelService,
  LegendService,
  MapsModule,
  ZoomService,
} from '@syncfusion/ej2-angular-maps';
import { MapsTooltipService } from '@syncfusion/ej2-angular-maps';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DomSanitizer } from '@angular/platform-browser';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { LiveResultService } from '../../services/result/live-result.service';
import { MapService } from '../../services/map/map.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ConfiguratorService } from '../../services/configurator/configurator.service';

@Component({
  selector: 'app-result-map',
  standalone: true,
  imports: [
    CommonModule,
    MapsModule,
    NzSpinModule,
    NzSelectModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    RouterLink,
    NzCardModule,
  ],
  providers: [MapsTooltipService, DataLabelService, ZoomService, LegendService],
  templateUrl: './result-map.component.html',
  styleUrl: './result-map.component.scss',
})
export class ResultMapComponent implements OnInit, OnChanges {
  @Input() stateName: any;
  @Output() dataEvent = new EventEmitter<any>();
  // stateName: any = { state: 'Delhi', state_code: 'DL', reload: true };

  resultOptionData: any = [];

  selectedOption: any;

  partyColorData: any;
  partyColorBi: any;

  selectedColorData: any;
  selectedColorData_2: any;

  mapData: any;
  crsData: any;

  predeictionPartyData: any;
  actualPartyData: any;

  public tooltipSettings?: object;
  public shapeData?: any;
  public shapeSettings?: object;
  public dataLabelSettings?: object;
  public zoomSettings?: object;
  public shapePropertyPath = 'AC_NAME';
  public shapeDataPath = 'AC_NAME';
  public legendSettings?: object;

  conclusionData: any;
  differenceListData: any;
  allPartyData: any;
  isVisible: boolean = false;

  loader: {
    resultOption: boolean;
  } = {
    resultOption: false,
  };

  constructor(
    private message: NzMessageService,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
    private mapService: MapService,
    private configuationService: ConfiguratorService,
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stateName']?.currentValue?.reload) {
      this.getUpdatedMapColor();
    }
  }

  ngOnInit(): void {
    this.getResultOptions();
    this.getPartyColor();

    this.shapeSettings = {
      border: {
        color: 'white',
        width: 1,
      },
      colorValuePath: 'AreaColor',
    };
    this.tooltipSettings = {
      visible: true,
      valuePath: 'SUMMARY',
    };
    this.zoomSettings = {
      enable: true,
      shouldZoomInitially: true,
      toolbarSettings: {
        horizontalAlignment: 'Near',
      },
    };
    this.legendSettings = {
      visible: true,
      valuePath: 'Party',
      position: 'Right',
      alignment: 'Near',
      border: {
        color: 'red',
        width: 2,
      },
      removeDuplicateLegend: true,
      title: {
        description: 'Party title',
        text: 'Party',
      },
    };
  }
  getResultOptions() {
    this.loader.resultOption = true;
    this.configuationService.getBiKeys(this.stateName?.state).subscribe(
      (data: any) => {
        this.resultOptionData = data
          ?.filter((i: any) => i?.IsResult)
          ?.map((i: any) => ({
            label: i?.Field?.toUpperCase(),
            value: i?.Field,
          }));
        this.selectedOption = this.resultOptionData[0].value;
        this.loader.resultOption = false;
      },
      (error: any) => {
        this.loader.resultOption = false;
        console.error('Error fetching Bi keys:', error);
        this.messageService.error('Failed to fetch Bi keys. Please try again later.');
      },
    );
  }

  resultData() {
    this.liveResultService
      .getLiveResult(this.stateName?.state, this.stateName?.state_code)
      .subscribe(
        (res: any) => {
          this.actualPartyData = res?.map((i: any) => {
            return {
              AC_NO: i.AC_NO,
              AC_NAME: i.AC_NAME,
              actual: i?.RESULT_25,
            };
          });

          this.predeictionPartyData = res?.map((i: any) => {
            return {
              AC_NO: i.AC_NO,
              AC_NAME: i.AC_NAME,
              prediction: i?.[this.selectedOption],
            };
          });

          this.dataforLabel();
          this.getConclusionData();
        },
        (err: any) => {
          console.error(err);
          this.messageService.error('Failed to fetch Predicted result');
        },
      );
  }

  dataforLabel() {
    let folderName = this.stateName?.state?.toUpperCase();
    folderName = folderName.replace(/[&_]/g, '_');
    folderName = folderName.replace(/_+/g, '_');

    let fileName = folderName + '_ASSEMBLY.geojson';
    let selected_Data: any = [];
    let selected_Data_2: any = [];

    this.mapService.getMapData(folderName, fileName).subscribe(
      (data: any) => {
        let new_data = data?.features;
        this.mapData = data?.features;
        this.crsData = data?.crs;

        new_data.map((feature: any) => {
          let data = this.predeictionPartyData?.find(
            (i: any) => i?.AC_NO == feature?.properties?.AC_NO,
          );
          selected_Data.push({
            AC_NAME: feature?.properties?.AC_NAME,
            Party: data?.prediction,
            AreaColor: this.getColorCodeBi(data?.prediction),
          });
          let data2 = this.actualPartyData?.find(
            (i: any) => i?.AC_NO == feature?.properties?.AC_NO,
          );

          selected_Data_2.push({
            AC_NAME: feature?.properties?.AC_NAME,
            Party: data2?.actual,
            AreaColor: this.getColorCodeBi(data2?.actual),
          });

          const htmlString = `
              <div><strong>Ac No:</strong> ${feature?.properties?.AC_NO}</div><br/>
          <div><strong>Ac Name:</strong> ${feature?.properties?.AC_NAME}</div><br/>
                    <div><strong>Actual Result:</strong> ${
                      data2?.actual?.split(' ')[0] || ''
                    }</div><br/>         
          <div><strong> Predicted Result:</strong> ${
            data?.prediction?.split(' ')[0] || ''
          }</div><br/>
          <div><strong>Actual Vote Share:</strong> ${
            data2?.actual?.split(' ')[1] || ''
          }</div><br/>         
        <div><strong> Predicted Vote Share:</strong> ${
          data?.prediction?.split(' ')[1] || ''
        }</div><br/>
      `;
          feature.properties.SUMMARY = htmlString;
        });

        this.selectedColorData = selected_Data;
        this.selectedColorData_2 = selected_Data_2;

        let map_data = {
          crs: data?.crs,
          type: 'FeatureCollection',
          features: new_data,
        };
        this.shapeData = map_data;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.message.error('Failed to Load Map data. Please try again later.');
        this.shapeData = [];
      },
    );
  }

  getUpdatedMapColor() {
    this.liveResultService
      .getLiveResult(this.stateName?.state, this.stateName?.state_code)
      .subscribe(
        (res: any) => {
          this.actualPartyData = res?.map((i: any) => {
            return {
              AC_NO: i.AC_NO,
              AC_NAME: i.AC_NAME,
              actual: i?.RESULT_25,
            };
          });

          this.predeictionPartyData = res?.map((i: any) => {
            return {
              AC_NO: i.AC_NO,
              AC_NAME: i.AC_NAME,
              prediction: i?.[this.selectedOption],
            };
          });

          let selected_Data: any = [];
          let selected_Data_2: any = [];

          let new_data = this.mapData;

          new_data.map((feature: any) => {
            let data = this.predeictionPartyData?.find(
              (i: any) => i?.AC_NO == feature?.properties?.AC_NO,
            );
            selected_Data.push({
              AC_NAME: feature?.properties?.AC_NAME,
              Party: data?.prediction,
              AreaColor: this.getColorCodeBi(data?.prediction),
            });
            let data2 = this.actualPartyData?.find(
              (i: any) => i?.AC_NO == feature?.properties?.AC_NO,
            );

            selected_Data_2.push({
              AC_NAME: feature?.properties?.AC_NAME,
              Party: data2?.actual,
              AreaColor: this.getColorCodeBi(data2?.actual),
            });

            const htmlString = `
            <div><strong>Ac No:</strong> ${feature?.properties?.AC_NO}</div><br/>
        <div><strong>Ac Name:</strong> ${feature?.properties?.AC_NAME}</div><br/>
                  <div><strong>Actual Result:</strong> ${
                    data2?.actual?.split(' ')[0] || ''
                  }</div><br/>         
        <div><strong> Predicted Result:</strong> ${data?.prediction?.split(' ')[0] || ''}</div><br/>
         <div><strong>Actual Vote Share:</strong> ${
           data2?.actual?.split(' ')[1] || ''
         }</div><br/>         
        <div><strong> Predicted Vote Share:</strong> ${
          data?.prediction?.split(' ')[1] || ''
        }</div><br/>
    `;
            feature.properties.SUMMARY = htmlString;
          });

          this.selectedColorData = selected_Data;
          this.selectedColorData_2 = selected_Data_2;

          let map_data = {
            crs: this.crsData,
            type: 'FeatureCollection',
            features: new_data,
          };
          this.shapeData = map_data;

          this.getConclusionData();
        },
        (err: any) => {
          console.error(err);
          this.messageService.error('Failed to fetch Predicted result');
        },
      );
  }

  getColorCode(party: string): string {
    let colorCode =
      this.partyColorData?.find(
        (partyDataColorList: any) =>
          partyDataColorList.PARTY?.replace(/[() ]/g, '') == party?.replace(/[() ]/g, ''),
      )?.CODES || null;
    return `${colorCode}`;
  }

  getColorCodeBi(data: any) {
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

    return `${colorCodes}`;
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  removeLabel() {
    if (this.isBrowser()) {
      const banners = document.querySelectorAll(
        'div[style*="position: fixed"][style*="top: 10px"][style*="left: 10px"]',
      );
      banners.forEach((banner) => {
        if (
          banner.textContent &&
          banner.textContent.includes(
            'This application was built using a trial version of Syncfusion Essential Studio',
          )
        ) {
          if (banner.parentNode) {
            this.renderer.removeChild(banner.parentNode, banner);
          }
        }
      });

      const overlay = document.querySelector(
        'div[style*="position: fixed"][style*="top: 0"][style*="left: 0"][style*="right: 0"][style*="bottom: 0"][style*="background-color: rgba(0, 0, 0, 0.5)"]',
      );
      if (overlay && overlay.parentNode) {
        this.renderer.removeChild(overlay.parentNode, overlay);
      }
    }
  }

  getPartyColor() {
    this.liveResultService.getPartyColor().subscribe(
      (res: any) => {
        this.partyColorData = res?.party_color;
        this.getPartyBiColorResult();
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch party  color result');
      },
    );
  }

  getPartyBiColorResult() {
    this.liveResultService.getPartyColorBi().subscribe(
      (res: any) => {
        this.partyColorBi = res?.party_color;
        this.resultData();
      },
      (err: any) => {
        console.error(err);
        this.messageService.error('Failed to fetch party bi result');
      },
    );
  }

  onSelectedOptionChange(event: any) {
    // console.log(event);
    this.shapeData = null;
    this.conclusionData = null;
    this.getUpdatedMapColor();
    this.dataEvent.emit(event);
  }

  getConclusionData() {
    this.conclusionData = null;
    let allParty = [
      ...new Set([
        ...this.actualPartyData.map((i: any) => i?.actual?.split(' ')[0]),
        ...this.predeictionPartyData.map((i: any) => i?.prediction?.split(' ')[0]),
      ]),
    ];
    this.allPartyData = allParty;
    let allConclusion = allParty?.map((party: any) => {
      let actual = this.actualPartyData?.filter(
        (i: any) => i?.actual?.split(' ')[0] == party,
      )?.length;
      let prediction = this.predeictionPartyData?.filter(
        (i: any) => i?.prediction?.split(' ')[0] == party,
      )?.length;
      let difference = actual - prediction;
      return {
        party,
        actual,
        prediction,
        difference,
      };
    });
    this.conclusionData = allConclusion;

    let differenceConclusion = this.actualPartyData
      .map((i: any) => {
        let da = this.predeictionPartyData.find((j: any) => j.AC_NO == i.AC_NO);

        if (da?.prediction?.split(' ')[0] != i?.actual?.split(' ')[0]) {
          return {
            ...da,
            prediction: da?.prediction?.split(' ')[0],
            actual: i?.actual?.split(' ')[0],
          };
        }

        return null;
      })
      .filter((i: any) => i != null);

    this.differenceListData = differenceConclusion;
  }

  toggleDifference() {
    this.isVisible = !this.isVisible;
  }
}
