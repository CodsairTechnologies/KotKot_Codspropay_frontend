import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) {
    this.toastr.toastrConfig.positionClass = 'toast-top-right';
    this.toastr.toastrConfig.extendedTimeOut = 2000;
    this.toastr.toastrConfig.progressBar = true;
  }

  showSuccess(message: string, title?: string): void {
    this.toastr.success(message, title, {
      tapToDismiss: true,
      positionClass: 'toast-top-right'
    });
  }

  showError(message: string, title?: string): void {
    this.toastr.error(message, title);
  }

  showInfo(message: string, title?: string): void {
    this.toastr.info(message, title);
  }

  showWarning(message: string, title?: string): void {
    this.toastr.warning(message, title);
  }}
