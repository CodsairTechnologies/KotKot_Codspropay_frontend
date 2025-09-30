import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(
    private toastr: ToastService,
    private router: Router
  ) {}


  handleErrorResponse(error: any, loader: { value: boolean }): void {
  loader.value = false;

  if (error.status === 401) {
    this.toastr.showError('Invalid token. Please log in again to continue.');
    setTimeout(() => {
      this.logout();
    }, 1500);
  } else if (error.status === 404) {
    this.router.navigate(['/page-not-found']);
  }else if (error.status === 500) {
    this.router.navigate(['/server-error']); 
  }
  else if (error.status === 0) {
    this.toastr.showError('Unable to connect to the internet. Please check your network settings.');
  } else {
    this.toastr.showError('Something went wrong. Please try again later.');
    this.router.navigate(['/error-page']);
  }
}


  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }}
