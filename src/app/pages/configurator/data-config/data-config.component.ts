import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ExcelParserService } from '../../../services/excel-parser/excel-parser.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ConfiguratorService } from '../../../services/configurator/configurator.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
@Component({
  selector: 'app-data-config',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzCardModule,
    NzUploadModule,
  ],
  host: { ngSkipHydration: 'true' },
  templateUrl: './data-config.component.html',
  styleUrl: './data-config.component.css',
})
export class DataConfigComponent implements OnInit {
  data: any = [];
  columns: any = [];
  stateList: any = [];
  dataConfigForm: FormGroup;
  selectLoader: {
    state: boolean;
  } = {
    state: false,
  };
  fileList: NzUploadFile[] = [];
  fileError: boolean = false;

  constructor(
    private excelParser: ExcelParserService,
    private configuationService: ConfiguratorService,
    private messageService: NzMessageService,
    private fb: FormBuilder,
  ) {
    this.dataConfigForm = this.fb.group({
      state: [''],
    });
  }

  ngOnInit(): void {
    this.loadStateList();
  }

  loadStateList() {
    this.selectLoader.state = true;
    this.configuationService.state_key_list().subscribe(
      (res: any) => {
        const uniqueStatesMap = new Map();

        res?.forEach((i: any) => {
          uniqueStatesMap.set(i?.State_Code, {
            label: i?.State_Name,
            value: i?.State_Code,
          });
        });

        this.stateList = Array.from(uniqueStatesMap.values());

        this.selectLoader.state = false;
      },
      (error: any) => {
        this.selectLoader.state = false;
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  // async onFileChange(event: any): Promise<void> {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   try {
  //     const parsedData = await this.excelParser.parseFile(file);
  //     this.data = parsedData;
  //     this.columns = this.data.length > 0 ? Object.keys(this.data[0]) : [];
  //   } catch (error) {
  //     console.error('File parsing error:', error);
  //   }
  // }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = [file]; // allow only one file
    return false; // prevent auto-upload
  };

  onFileChange(event: any): void {
    console.log('Upload event triggered:', event);

    if (event.type === 'removed') {
      this.fileList = [];
      this.data = [];
      this.columns = [];
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
          this.data = parsedData;
          this.columns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
          if (this.data.length > 0) {
            let firstRow = this.data[0];
            console.log(firstRow);
            if (!(Object.keys(firstRow)?.map((i: any) => i?.toLowerCase())?.includes('ac_no'))) {
              this.messageService.create('error', 'Ac No column is required');
              this.fileError = true;
              // Optional: Set file status to 'error'
              event.file.status = 'error';
            } else if (!(Object.keys(firstRow)?.map((i: any) => i?.toLowerCase())?.includes('ll'))) {
              this.messageService.create('error', 'LL column is required');
              this.fileError = true;
              // Optional: Set file status to 'error'
              event.file.status = 'error';
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
    // console.log('Saving to DB:', this.data);
    let dataToSave = {
      table_name: `${this.dataConfigForm.get('state')?.value}_BI_RESULT`,
      data: this.data,
    };
    this.configuationService.uploadBiResult(dataToSave).subscribe(
      (res: any) => {
        console.log('Data saved successfully:', res);
        this.messageService.success(res?.message);
      },
      (error: any) => {
        console.error('Error saving data:', error);
        this.messageService.error('Failed to save data. Please try again later.');
      },
    );
  }

  calculateScrollWidth(): string {
    const columnWidth = 150; // Average column width in pixels
    return `${this.columns.length * columnWidth}px`;
  }
}
