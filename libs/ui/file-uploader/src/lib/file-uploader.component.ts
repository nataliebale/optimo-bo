import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { ClientService } from '@optimo/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent {
  @Input()
  id: string;

  @Input()
  shownImage: any;

  @Input()
  error: boolean;

  @Output()
  uploaded = new EventEmitter();

  @Input()
  uploadEndpoint = 'uploads/images';

  @Input()
  uploadFileParamName = 'file';

  @Input()
  customAcceptTypes = 'image/jpg, image/jpeg, image/png';

  @Input()
  uploadType = 'image'

  @Input()
  hideDefaultLabel = false

  @Input()
  emitFileName = false

  showValidationMessage: boolean;

  constructor(private client: ClientService) {}

  drop(e: DragEvent): void {
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;

    this.handleFileInput(files);
  }

  handleFileInput(fileList: any): void {
    console.log('handling files', fileList);
    this.showValidationMessage = false;
    if (fileList && fileList[0]) {
      const file = fileList[0];
      if (/\.(?:jpe?g|png)$/i.test(file.name)) {
        this.showImageLocally(file);
        this.uploadFile(file);
        return;
      } else if (this.uploadType = 'file') {
        this.uploadFile(file);
        return;
      }
    }
    this.showValidationMessage = true;
  }

  private async uploadFile(file: any) {
    console.log('uploading single file:', file);
    try {
      const response = await this.uploadImage(file);

      console.log('uploaded file response:', response);

      if (response) {
        this.uploaded.emit(this.emitFileName ? {response: response, fileName: file.name}: response);
      } else {
        this.removeImageLocally();
      }
    } catch (err) {
      this.removeImageLocally();
    }
  }

  private uploadImage(file: any) {
    const formData = new FormData();
    // formData.append('file', file, file.name);
    formData.append(this.uploadFileParamName, file, file.name);
    
    return this.client
      .post(this.uploadEndpoint, formData, { file: true })
      .toPromise();
  }

  private showImageLocally(file: any): void {
    const reader = new FileReader();

    reader.onload = (evt: any) => {
      this.shownImage = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  private removeImageLocally(): void {
    this.shownImage = null;
  }
}
