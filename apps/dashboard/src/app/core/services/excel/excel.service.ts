import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { flatten } from 'lodash-es';
import { Observable } from 'rxjs';
import { FileDownloadHelper } from '../../helpers/file-download/file-download.helper.ts';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  constructor(private downloader: FileDownloadHelper) {}

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  importAsArray(file: any): Observable<any[]> {
    return new Observable(subscriber => {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        subscriber.next(flatten(data).filter(i => i));
        subscriber.complete();
      };
      reader.readAsBinaryString(file);
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    this.downloader.download(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );

    // FileSaver.saveAs(
    //   data,
    //   fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    // );
  }
}
