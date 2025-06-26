import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ConfiguratorService } from '../../../services/configurator/configurator.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LiveResultService } from '../../../services/result/live-result.service';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-keys-congigurator',
  imports: [
    NzCardModule,
    CommonModule,
    NzTableModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzButtonModule,
    NzSwitchModule,
    FormsModule,
  ],
  host: { ngSkipHydration: 'true' },
  templateUrl: './keys-congigurator.component.html',
  styleUrl: './keys-congigurator.component.scss',
})
export class KeysCongiguratorComponent implements OnInit {
  keysConfigForm: FormGroup;
  selectLoader: {
    state: boolean;
    submit: boolean;
    updateVisiblity: boolean;
  } = {
    state: false,
    submit: false,
    updateVisiblity: false,
  };
  stateList: any;
  keysTableData: any = [];

  constructor(
    private fb: FormBuilder,
    private configuationService: ConfiguratorService,
    private messageService: NzMessageService,
    private liveResultService: LiveResultService,
  ) {
    this.keysConfigForm = this.fb.group({
      state: [''],
    });
  }

  ngOnInit(): void {
    this.fetchStates();

    this.keysConfigForm.get('state')?.valueChanges?.subscribe((res: any) => {
      this.keysTableData = [];
    });
  }

  fetchStates() {
    this.selectLoader.state = true;
    this.liveResultService.getStateCode().subscribe(
      (data: any) => {
        console.log(data);
        this.selectLoader.state = false;
        this.stateList = data.map((state: any) => ({
          label: state?.state,
          value: state?.state_code,
        }));
      },
      (error: any) => {
        this.selectLoader.state = false;
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  submit() {
    this.selectLoader.submit = true;
    const state = this.stateList.find(
      (i: any) => i.value === this.keysConfigForm.get('state')?.value,
    )?.label;
    this.configuationService.getBiKeys(state).subscribe(
      (data: any) => {
        // console.log(data);
        this.keysTableData = data;
        this.selectLoader.submit = false;
      },
      (error: any) => {
        this.selectLoader.submit = false;
        console.error('Error fetching states:', error);
        this.messageService.error('Failed to fetch states. Please try again later.');
      },
    );
  }

  updateKeys() {
    this.selectLoader.updateVisiblity = true;
    const updatedData = this.keysTableData.map((row: any) => ({
      Id: row.Id,
      IsVisible: row.IsVisible,
      IsResult: row.IsResult,
    }));
    console.log(updatedData);

    this.configuationService.updateBiKeys(updatedData).subscribe(
      (res: any) => {
        this.messageService.success('Keys updated successfully!');
        this.selectLoader.updateVisiblity = false;
      },
      (error: any) => {
        this.messageService.error('Failed to update keys.');
        console.error(error);
        this.selectLoader.updateVisiblity = false;
      },
    );
  }
}
