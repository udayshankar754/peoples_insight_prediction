import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LiveResultService } from '../../../services/result/live-result.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ConfiguratorService } from '../../../services/configurator/configurator.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { ExcelParserService } from '../../../services/excel-parser/excel-parser.service';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-turnout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzButtonModule,
    NzTableModule,
    FormsModule,
    NzInputModule,
    NzUploadModule,
    NzCardModule,
  ],
  host: { ngSkipHydration: 'true' },
  templateUrl: './turnout.component.html',
  styleUrl: './turnout.component.scss',
})
export class TurnoutComponent implements OnInit {
  formData: FormGroup;
  loader: {
    state: boolean;
    stateColumnKey: boolean;
    submit: boolean;
    saveToDb: boolean;
  } = { state: false, stateColumnKey: false, submit: false, saveToDb: false };
  states: any;
  stateColumnKeys: any;
  acWiseTurnout: any = [];
  boothWardWiseTurnout: any = [];
  acWiseTurnoutClone: any = [];
  boothWardWiseTurnoutClone: any = [];
  fileList: NzUploadFile[] = [];
  fileError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private liveResultService: LiveResultService,
    private messageService: NzMessageService,
    private configuationService: ConfiguratorService,
    private excelParser: ExcelParserService,
  ) {
    this.formData = this.fb.group({
      state: ['', [Validators.required]],
      stateColumnKey: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadStateList();

    this.formData.get('state')?.valueChanges.subscribe((value: any) => {
      this.reset('state');
      const state = this.states.find((state: any) => state.value === value);
      if (state) {
        this.loadStateColumnKeyList(state.value);
      }
    });

    this.formData.get('stateColumnKey')?.valueChanges.subscribe((value: any) => {
      this.reset('stateColumnKey');
    });
  }

  loadStateList() {
    this.loader.state = true;
    this.configuationService.state_key_list().subscribe(
      (res: any) => {
        const uniqueStatesMap = new Map();

        res?.forEach((i: any) => {
          uniqueStatesMap.set(i?.State_Code, {
            label: i?.State_Name,
            value: i?.State_Code,
          });
        });

        this.states = Array.from(uniqueStatesMap.values());

        this.loader.state = false;
      },
      (error: any) => {
        this.loader.state = false;
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  loadStateColumnKeyList(state: any) {
    this.loader.stateColumnKey = true;
    this.configuationService.state_column_key_list(state).subscribe(
      (res: any) => {
        let columnKeys = [
          {
            label: 'AC NO',
            value: 'AC_NO',
          },
          {
            label: 'WARD NO',
            value: 'WARD_NO',
          },
          {
            label: 'PART NO',
            value: 'PART_NO',
          },
        ];

        this.stateColumnKeys = columnKeys.filter((i: any) =>
          res?.map((j: any) => j?.toLowerCase())?.includes(i?.value.toLowerCase()),
        );

        this.loader.stateColumnKey = false;
      },
      (error: any) => {
        this.loader.stateColumnKey = false;
        console.error('Error fetching state column keys:', error);
        this.messageService.error('Failed to fetch state column keys. Please try again later.');
      },
    );
  }

  submit() {
    this.reset('submit');
    this.loader.submit = true;
    if (this.formData.get('stateColumnKey')?.value == 'AC_NO') {
      this.configuationService.turnoutAcwise(this.formData.get('state')?.value).subscribe(
        (res: any) => {
          // console.log(res);
          this.acWiseTurnout = res;
          this.acWiseTurnoutClone = res.map((item: any) => ({ ...item }));
          this.loader.submit = false;
        },
        (error: any) => {
          this.loader.submit = false;
          console.error('Error fetching Ac wise Turnout:', error);
          this.messageService.error('Failed to fetch Ac wise Turnout. Please try again later.');
        },
      );
    } else {
      this.configuationService.turnoutBoothWardWise(this.formData.get('state')?.value).subscribe(
        (res: any) => {
          console.log(res);
          this.boothWardWiseTurnout = res;
          this.boothWardWiseTurnoutClone = res.map((item: any) => ({ ...item }));
          this.loader.submit = false;
        },
        (error: any) => {
          this.loader.submit = false;
          console.error('Error fetching Booth Ward Wise Turnout:', error);
          this.messageService.error(
            'Failed to fetch Booth Ward Wise Turnout. Please try again later.',
          );
        },
      );
    }
  }

  onFileChange(event: any): void {
    console.log('Upload event triggered:', event);

    if (event.type === 'removed') {
      this.fileList = [];
      this.reset('fileChanges');
    } else {
      this.fileError = false;
      const file = event.file?.originFileObj;

      if (!file) {
        this.messageService.error('No valid file provided.');
        return;
      }

      // Manually mark upload status as successful
      event.file.status = 'done';
      this.fileList = [event.file];

      this.excelParser
        .parseFile(file)
        .then((parsedData: any[]) => {
          console.log(parsedData);

          if (parsedData.length > 0) {
            let firstRow = parsedData[0];

            if (
              !Object.keys(firstRow)
                ?.map((i: any) => i?.toLowerCase())
                ?.includes('turnout')
            ) {
              this.messageService.create('error', 'Turnout column is required');
              this.fileError = true;
              // Optional: Set file status to 'error'
              event.file.status = 'error';
            } else if (
              !Object.keys(firstRow)
                ?.map((i: any) => i?.toLowerCase())
                ?.includes('ac_no')
            ) {
              this.messageService.create('error', 'Ac No column is required');
              this.fileError = true;
              // Optional: Set file status to 'error'
              event.file.status = 'error';
            }

            if (this.formData.get('stateColumnKey')?.value == 'AC_NO') {
              this.acWiseTurnout = this.acWiseTurnout?.map((i: any) => {
                return {
                  ...i,
                  AC_TURNOUT:
                    parsedData.find((j: any) => j?.AC_NO == i?.AC_NO)?.TURNOUT || i?.AC_TURNOUT,
                };
              });
            } else if (this.formData.get('stateColumnKey')?.value == 'WARD_NO') {
              if (
                Object.keys(firstRow)
                  ?.map((i: any) => i?.toLowerCase())
                  ?.includes('ward_no')
              ) {
                this.boothWardWiseTurnout = this.boothWardWiseTurnout?.map((i: any) => {
                  return {
                    ...i,
                    WARD_TURNOUT:
                      parsedData.find((j: any) => j?.WARD_NO == i?.WARD_NO && j?.AC_NO == i?.AC_NO)
                        ?.TURNOUT || i?.WARD_TURNOUT,
                  };
                });
              } else {
                this.messageService.create('error', 'Ward No column is required');
                this.fileError = true;
                // Optional: Set file status to 'error'
                event.file.status = 'error';
              }
            } else if (this.formData.get('stateColumnKey')?.value == 'PART_NO') {
              if (
                Object.keys(firstRow)
                  ?.map((i: any) => i?.toLowerCase())
                  ?.includes('part_no')
              ) {
                this.boothWardWiseTurnout = this.boothWardWiseTurnout?.map((i: any) => {
                  return {
                    ...i,
                    PART_NO_TURNOUT:
                      parsedData.find((j: any) => j?.PART_NO == i?.PART_NO && j?.AC_NO == i?.AC_NO)
                        ?.TURNOUT || i?.PART_NO_TURNOUT,
                  };
                });
              } else {
                this.messageService.create('error', 'Part No column is required');
                this.fileError = true;
                // Optional: Set file status to 'error'
                event.file.status = 'error';
              }
            } else {
            }
          }
        })
        .catch((error) => {
          this.fileError = true;
          console.error('File parsing error:', error);
          this.messageService.error('Failed to parse uploaded file.');
          // Optional: Set file status to 'error'
          event.file.status = 'error';
        });
    }
  }

  saveToDatabase() {
    this.loader.saveToDb = true;
    if (this.formData.get('stateColumnKey')?.value == 'AC_NO') {
      const changedData = this.acWiseTurnout.filter((modified: any) => {
        const original = this.acWiseTurnoutClone.find(
          (clone: any) => clone.AC_NO === modified.AC_NO,
        );
        return original && modified.AC_TURNOUT !== original.AC_TURNOUT;
      });
      this.configuationService
        .updateTurnoutAcWise(this.formData.get('state')?.value, { data: changedData })
        .subscribe(
          (response: any) => {
            console.log('Data saved successfully:', response);
            this.loader.saveToDb = false;
            this.messageService.create(
              'success',
              response?.updatedCount + response?.message || 'Data saved successfully',
            );
          },
          (error: any) => {
            this.loader.saveToDb = false;
            console.error('Error saving data:', error);
            this.messageService.error(error?.error?.message || error?.error?.error  || 'Failed to save data to database.');
          },
        );
    } else if (this.formData.get('stateColumnKey')?.value == 'WARD_NO') {
      const changedData = this.boothWardWiseTurnout.filter((modified: any) => {
        const original = this.boothWardWiseTurnoutClone.find(
          (clone: any) => clone.AC_NO === modified.AC_NO && clone.BOOTH_NO === modified.BOOTH_NO,
        );
        return original && modified.WARD_TURNOUT !== original.WARD_TURNOUT;
      });

      this.configuationService
        .updateTurnoutBoothWardWise(this.formData.get('state')?.value, {
          data: changedData,
          isPart: false,
        })
        .subscribe(
          (response: any) => {
            console.log('Data saved successfully:', response);
            this.loader.saveToDb = false;

            this.messageService.create(
              'success',
              response?.updatedCount + response?.message || 'Data saved successfully',
            );
          },
          (error: any) => {
            this.loader.saveToDb = false;

            console.error('Error saving data:', error);
            this.messageService.error(error?.error?.message || error?.error?.error  || 'Failed to save data to database.');
          },
        );
    } else if (this.formData.get('stateColumnKey')?.value == 'PART_NO') {
      const changedData = this.boothWardWiseTurnout.filter((modified: any) => {
        const original = this.boothWardWiseTurnoutClone.find(
          (clone: any) => clone.AC_NO === modified.AC_NO && clone.PART_NO === modified.PART_NO,
        );
        return original && modified.PART_NO_TURNOUT !== original.PART_NO_TURNOUT;
      });

      this.configuationService
        .updateTurnoutBoothWardWise(this.formData.get('state')?.value, {
          data: changedData,
          isPart: true,
        })
        .subscribe(
          (response: any) => {
            console.log('Data saved successfully:', response);
            this.messageService.create(
              'success',
              response?.updatedCount + response?.message || 'Data saved successfully',
            );

            this.loader.saveToDb = false;
          },
          (error: any) => {
            this.loader.saveToDb = false;

            console.error('Error saving data:', error);
            this.messageService.error(error?.error?.message || error?.error?.error || 'Failed to save data to database.');
          },
        );
    }
  }

  reset(columnName: string) {
    switch (columnName) {
      case 'state':
        this.formData.get('stateColumnKey')?.reset();
        this.acWiseTurnout = [];
        this.boothWardWiseTurnout = [];
        this.acWiseTurnoutClone = [];
        this.boothWardWiseTurnoutClone = [];
        break;
      case 'stateColumnKey':
        this.acWiseTurnout = [];
        this.boothWardWiseTurnout = [];
        this.acWiseTurnoutClone = [];
        this.boothWardWiseTurnoutClone = [];
        break;
      case 'submit':
        this.acWiseTurnout = [];
        this.boothWardWiseTurnout = [];
        this.acWiseTurnoutClone = [];
        this.boothWardWiseTurnoutClone = [];
        break;

      case 'fileChanges':
        this.acWiseTurnout = this.acWiseTurnoutClone;
        this.boothWardWiseTurnout = this.boothWardWiseTurnoutClone;
        break;
    }
  }
}
