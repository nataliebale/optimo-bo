import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadHelper {
  download(blob: Blob, fileName: string): void {
    const data = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );

    setTimeout(() => {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
  }

  downloadFromResponse(
    httpResponse: HttpResponse<Blob>,
    fileType: string
  ): void {
    const blob = new Blob([httpResponse.body], {
      type: fileType
    });
    const fileName = this.getFileNameFromHttpResponse(httpResponse.headers);
    this.download(blob, fileName);
  }

  private getFileNameFromHttpResponse(headers: HttpHeaders) {
    try {
      const contentDispositionHeader = headers.get('Content-Disposition');
      const result = contentDispositionHeader
        .split(';')[1]
        .trim()
        .split('=')[1];
      return result.replace(/"/g, '');
    } catch {
      return 'file';
    }
  }
}
