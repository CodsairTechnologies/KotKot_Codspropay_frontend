import { ApiService } from '../../core/services/api.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginatorModule } from 'primeng/paginator';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-singleview-advancesalary',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
          CommonModule, NgSelectModule, PaginatorModule, 
          FormsModule],
  templateUrl: './singleview-advancesalary.component.html',
  styleUrl: './singleview-advancesalary.component.css'
})
export class SingleviewAdvancesalaryComponent {
 viewAdSalaryForm!: FormGroup;

  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  salaryID: any;

  salarybyidList: any = [];
  salaryhistory: any[] = [];

  selectedRange: any;

  isLoan: any;

  EMPID: any;
  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");


    this.salaryID = sessionStorage.getItem("advanceid");
    this.EMPID = sessionStorage.getItem("empid");



    if (!this.token) {
      this.toastrService.showError('Token not available. Please log in again.');
      this.router.navigateByUrl('/login');
      return;
    }


    this.viewAdSalaryForm = this.formBuilder.group({
      EmpId: ['', Validators.required],
      Name: [''],
      Salary: [''],
      Department: [''],
      Unit: [''],
      Loan: [''],
      LoanAmount: [''],
      Emi: [''],
      balanceEmi: [''],
      balanceamount: [''],
  
     
      AdAmount: [''],
      Month: [''],
      PaidDate: ['']


    })

    this.getSalaryByIdFn();
  }



  /** get salary by id*/

  getSalaryByIdFn() {

     this.apiService.postData(environment.apiUrl + 'codspropay/api/getadvancedetails/', { advanceid: this.salaryID, empid: this.EMPID }).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.salarybyidList = response['advanceemployeelist'];
        if (this.salarybyidList && this.salarybyidList.length > 0) {
          const adSalalary = this.salarybyidList[0];

          this.viewAdSalaryForm.controls['Name'].setValue(adSalalary.employeename);
          this.viewAdSalaryForm.controls['EmpId'].setValue(adSalalary.employeeId);
          this.viewAdSalaryForm.controls['Salary'].setValue(adSalalary.salary);
          this.viewAdSalaryForm.controls['Department'].setValue(adSalalary.department_name);
          // this.viewAdSalaryForm.controls['Unit'].setValue(adSalalary.unitname);
          this.viewAdSalaryForm.controls['Loan'].setValue(adSalalary.loan);
          this.viewAdSalaryForm.controls['LoanAmount'].setValue(adSalalary.amount);
          this.viewAdSalaryForm.controls['Emi'].setValue(adSalalary.emiamount);
          this.viewAdSalaryForm.controls['balanceEmi'].setValue(adSalalary.balance_emi);
          this.viewAdSalaryForm.controls['balanceamount'].setValue(adSalalary.balanceamount);

          this.viewAdSalaryForm.controls['AdAmount'].setValue(adSalalary.advanceamount);
          this.viewAdSalaryForm.controls['Month'].setValue(adSalalary.date);
          this.viewAdSalaryForm.controls['PaidDate'].setValue(adSalalary.advancedate);


          this.EMPID = adSalalary.employeeid;

          console.log('employee id:', this.EMPID);

          this.isLoan = adSalalary.loan
          this.salaryhistory = response['previoussalarydetails'];
          console.log('salary history', this.salaryhistory);

        } else {
          console.log('No data found.');
        }
      }else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  /** get salary By id*/





  reloadCurrentPage() {
    window.location.reload();
  }

  clearForm(): void {
    this.viewAdSalaryForm.reset();
  }


     // Error handling methods remain unchanged
 private handleErrorResponse(response: any) {
  if (response['response'] === 'Error') {
    this.toastrService.showError(response.message);
    setTimeout(() => {
      this.Loader = false; // Hide loader after 1.5 seconds
    }, 1500);
  } else {
    this.toastrService.showWarning(response.message);
    this.Loader = false;
  }
}

private handleHttpError(error: any) {
  if (error.status === 401) {
    this.toastrService.showError('Invalid token. Please log in again.');
    setTimeout(() => {
      this.router.navigateByUrl('login');
    }, 1500);
  } else {
    this.toastrService.showError('Unable to process your request at the moment. Please try again later.');
    setTimeout(() => {
      this.Loader = false; // Hide loader after 12 seconds
    }, 12000);
  }
}


  closeForm() {
    this.router.navigateByUrl('super-admin/advance-salary')
  }

}
