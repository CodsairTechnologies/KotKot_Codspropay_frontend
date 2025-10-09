import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  selector: 'app-singleview-loan',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
          CommonModule, NgSelectModule, PaginatorModule, 
          FormsModule],
  templateUrl: './singleview-loan.component.html',
  styleUrl: './singleview-loan.component.css'
})
export class SingleviewLoanComponent {
viewLoanForm!: FormGroup;
  LoanForm!: FormGroup;


  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  EmpId: any;
  DriverId: any;
  rangeId: any;
  addKm: any
  empID: any
  vehiclenamelist: any = [];
  Employeelist: any = [];
  empbyidListlist: any = [];
  paymenthistory: any = [];

  paymentmonth: any;
  loanhistory: any = [];

  emiamount: any;

  emi: any;

  apiurl: any = environment.apiUrl;
  Promage: any;

  loanID: any;
  loanNo: any;
  EmployeeID: any;
  loanstatus: any;
  action: any;
  selectedMonth: any;
  selectedRange: any;
  balance: any;

  modalName: any;


  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strWidth: "5%", strKey: "slNo" },
    { strHeader: "Date", strAlign: "center", strWidth: "15%", strKey: "paiddate" },
    { strHeader: "EMI", strAlign: "center", strWidth: "15%", strKey: "emiamount" },
    { strHeader: "Status", strAlign: "center", strWidth: "15%", strKey: "status" },

  ]

  arrList: any = [];


  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");


    this.loanID = sessionStorage.getItem("id");
    this.loanNo = sessionStorage.getItem("LoanNo");
    this.EmployeeID = sessionStorage.getItem("EmpID");


    console.log("Loan ID:", this.loanID);
    console.log("Loan No:", this.loanNo);

    if (!this.token) {
      this.toastrService.showError('Token not available. Please log in again.');
      this.router.navigateByUrl('/login');
      return;
    }


    this.viewLoanForm = this.formBuilder.group({
      Name: [''],
      EmpId: [''],
      Salary: [''],
      Department: [''],
      Unit: [''],
      Date: [''],
      Amount: [''],
      Emi: [''],
      Repayment: [''],
      Closuredate: [''],
      balanceamount: [''],
      remainingemi: [''],
      totalemi: [''],
      loanno: [''],
    });


    this.LoanForm = this.formBuilder.group({

      month: ['', Validators.required],
      EMI: ['']

    });

    if (this.loanID && this.loanNo) {
      this.getLoanByIdFn(this.loanID, this.loanNo, this.EmployeeID);
    }
  }


  /** get Loan by id*/


  getLoanByIdFn(loanID: string, loanNo: string, EmployeeID: string) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getloanbyid/', { id: loanID, loanNo: loanNo, employeeid: EmployeeID }, { headers: reqHeader }).subscribe((response: any) => {
      if (response.response === 'Success') {
        this.Loader = false;
        this.empbyidListlist = response['loanDetails'];
        if (this.empbyidListlist && this.empbyidListlist.length > 0) {
          const loan = this.empbyidListlist[0];

          this.viewLoanForm.controls['Name'].setValue(loan.employeename);
          this.viewLoanForm.controls['EmpId'].setValue(loan.employeeid);
          this.viewLoanForm.controls['Salary'].setValue(loan.basicsalary);
          this.viewLoanForm.controls['Department'].setValue(loan.department_name);
          // this.viewLoanForm.controls['Unit'].setValue(loan.unitname);

          this.viewLoanForm.controls['Date'].setValue(loan.date);
          this.viewLoanForm.controls['Amount'].setValue(loan.amount);
          this.viewLoanForm.controls['Emi'].setValue(loan.emiamount);
          this.viewLoanForm.controls['Repayment'].setValue(loan.repaymentdate);
          this.viewLoanForm.controls['Closuredate'].setValue(loan.closuredate);
          this.viewLoanForm.controls['balanceamount'].setValue(loan.balanceamount);
          this.viewLoanForm.controls['remainingemi'].setValue(loan.remainingemi);
          this.viewLoanForm.controls['totalemi'].setValue(loan.totalemi);
          this.viewLoanForm.controls['loanno'].setValue(loan.loanNo);

          this.loanstatus = loan.loanstatus;
          this.Promage = loan.profileimgurl;

          this.emi = loan.emiamount;

          this.balance = loan.balanceamount;

          console.log('emi amount', this.emi);

          this.arrList = response['paymentHistory'];
          this.arrList = response['paymentHistory'] as { paymentmonth: string, emiamount: string }[];

          response.paymentHistory.map((obj: { [x: string]: any; }, index: number) => {
            obj['slNo'] = index + 1;
          });
          this.paymentmonth = this.arrList.map((payment: { paymentmonth: string; emiamount: string }) => payment.paymentmonth);
          this.emiamount = this.arrList.map((payment: { paymentmonth: string; emiamount: string }) => payment.emiamount);

          console.log('Payment Months:', this.paymentmonth);
          console.log('EMI Amounts:', this.emiamount);
          console.log(this.arrList);

          this.loanhistory = response['loanhistory'];

        } else {
          console.log('No loan found.');
        }
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  /** get Loan By id*/




  setAction(action: string, mname: any) {
    this.action = action;
    this.modalName = mname
    if (action == 'forceCloseLoan') {
      this.LoanForm.controls['EMI'].setValue(this.balance);
    }
    else {
      this.LoanForm.controls['EMI'].setValue(this.emi);
    }

  }

  onMonthChange(event: any) {
    this.selectedMonth = event.target.value;
    console.log('Selected Month:', this.selectedMonth);
  }

  performAction() {
    switch (this.action) {
      case 'makePayment':
        this.makePayment();
        break;
      case 'skipPayment':
        this.skipPayment();
        break;
      case 'forceCloseLoan':
        this.forceCloseLoan();
        break;
      default:
        break;
    }
  }




  // Make payment

  makePayment() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });


    if (this.LoanForm.invalid) {
      this.LoanForm.markAllAsTouched();
      return
    }

    var formdata = new FormData;
    formdata.append('employeeid', this.EmployeeID);
    formdata.append('loanNo', this.loanNo);
    formdata.append('loanid', this.loanID);
    formdata.append('paymentmonth', this.selectedMonth);
    formdata.append('emiamount', this.emi);
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/addmakepayment/', formdata, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.toastrService.showSuccess(response.message);
        setTimeout(() => {
          this.reloadCurrentPage();
        }, 1000);
      }
      else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  // Skip Payment

  skipPayment() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    if (this.LoanForm.invalid) {
      this.LoanForm.markAllAsTouched();
      return
    }
    var formdata = new FormData;
    formdata.append('employeeid', this.EmployeeID);
    formdata.append('loanNo', this.loanNo);
    formdata.append('loanid', this.loanID);
    formdata.append('paymentmonth', this.selectedMonth);
    formdata.append('emiamount', this.emi);
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/addskippedpayment/', formdata, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.toastrService.showSuccess(response.message);
        this.reloadCurrentPage()
      }
      else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  // Force Close Loan

  forceCloseLoan() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    if (this.LoanForm.invalid) {
      this.LoanForm.markAllAsTouched();
      return
    }
    var formdata = new FormData;
    formdata.append('employeeid', this.EmployeeID);
    formdata.append('loanNo', this.loanNo);
    formdata.append('loanid', this.loanID);
    formdata.append('paymentmonth', this.selectedMonth);
    formdata.append('emiamount', this.LoanForm.get('EMI')?.value.toString());
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/foreclosure/', formdata, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.toastrService.showSuccess(response.message);
        setTimeout(() => {
          this.reloadCurrentPage();
        }, 1000);
      }
      else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }




  reloadCurrentPage() {
    window.location.reload();
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

}
