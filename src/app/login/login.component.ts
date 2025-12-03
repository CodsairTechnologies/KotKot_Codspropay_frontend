import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastService } from '../core/services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../core/services/auth.service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  Loader: boolean | undefined;

  errorMessage: string = '';
  isAdminLoggedIn: boolean = false;
  isDoctorLoggedIn: boolean = false;

  loginForm!: FormGroup;
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  token: any;
  type: any;
  adminid: any;
  userName: any;
  status: any;
  logindetails: any = [];

  isLoading: boolean = false;

  // arrUsers: any[] = [
  //   // { username: 'superadmin', password: 'admin123', role: 'super-admin' },
  //   // { username: 'doctor', password: 'doctor123', role: 'doctor' },
  //   // { username: 'receptionist', password: 'rec123', role: 'receptionist' }
  // ];

  isReceptionistLoggedIn: boolean | undefined;

  constructor(private router: Router, private formBuilder: FormBuilder, private toastrService: ToastService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],

    })

  }

  focusPassword() {
    // Focus the password input field when Enter is pressed
    const passwordField = document.getElementById('password') as HTMLElement;
    if (passwordField) {
      passwordField.focus();
    }
  }


  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Detect the browser name
    const getBrowserName = () => {
      const userAgent = navigator.userAgent;
      const vendor = navigator.vendor;

      if (/Edg/.test(userAgent)) {
        return 'Microsoft Edge';
      } else if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
        return 'Chrome';
      } else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
        return 'Safari';
      } else if (/Firefox/.test(userAgent)) {
        return 'Firefox';
      } else if (/MSIE|Trident/.test(userAgent)) {
        return 'Internet Explorer';
      } else {
        return 'Other';
      }
    };

    const browserName = getBrowserName();

    const payload = {
      username: this.loginForm.controls['username'].value,
      password: this.loginForm.controls['password'].value,
      loginbrowser: browserName,
    };

    this.isLoading = true;

    this.http.post(environment.apiUrl + 'api/hrlogin/', payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response['response'] == 'Success') {
        this.logindetails = response['logindetails'][0];

        this.token = this.logindetails['token'];
        this.adminid = this.logindetails['loginId'];
        this.userName = this.logindetails['username'];
        this.status = this.logindetails['status'];
        this.type = this.logindetails['type'];

        // --- AUTH INTEGRATION START ---
        // 1. Store the token using the AuthService's 'login' function.
        //    This uses localStorage as defined in AuthService.
        this.authService.login(this.token);
        // --- AUTH INTEGRATION END ---

        // You are currently storing other details in sessionStorage.
        // The token logic must be consistent (AuthService uses localStorage).
        sessionStorage.setItem("adminId", this.adminid);
        sessionStorage.setItem("username", this.userName);
        sessionStorage.setItem("status", this.status);
        sessionStorage.setItem("type", this.type);

        this.router.navigate(['/superadmin/dashboard']);
        this.toastrService.showSuccess('Login Successful!');
      }
      else {
        this.toastrService.showError(response.message || 'Invalid credentials.');
      }
    }, (error: any) => {
      this.isLoading = false;
      console.error('Login error:', error);
      this.toastrService.showError('An error occurred. Please try again.');
    });
  }



  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


}
