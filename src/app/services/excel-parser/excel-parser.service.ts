import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelParserService  {
  constructor() {}

  /**
   * Parses a File (CSV or Excel) and returns a Promise of JSON data.
   * @param file File input (from input[type="file"])
   */
  async parseFile(file: File): Promise<any[]> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    const data = await this.readFile(file);

    const workbook = XLSX.read(data, {
      type: 'binary',
      raw: false,
      cellDates: true
    });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return jsonData;
  }

  /**
   * Reads file content and returns binary string (Excel) or text (CSV).
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        resolve(e.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }
}
