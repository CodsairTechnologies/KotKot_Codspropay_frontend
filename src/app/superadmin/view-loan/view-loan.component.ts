import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-view-loan',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent, RouterModule,
    CommonModule, NgSelectModule, PaginatorModule,
    FormsModule],
  templateUrl: './view-loan.component.html',
  styleUrl: './view-loan.component.css'
})
export class ViewLoanComponent {
  first = 0;
  rows = 20;



  // arrList: any = [];

  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = true;
  blnForDelete: boolean = true;
  Loanid: any;

  deleteModal: boolean = false;

  LoanId: any;
  EmployeeId: any;

  arrList: any = [];

  constructor(private router: Router, private formbuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");
    this.getLoanTableFn()
  }


  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Emp ID", strAlign: "center", strKey: "employeeid" },
    { strHeader: "Emp Name", strAlign: "center", strKey: "employeename" },
    { strHeader: "Loan Amount", strAlign: "center", strKey: "amount" },
    { strHeader: "EMI", strAlign: "center", strKey: "emiamount" },
    { strHeader: "Balance Amount", strAlign: "center", strKey: "balanceamount" },
    { strHeader: "Date", strAlign: "center", strKey: "date" },
    { strHeader: "Status", strAlign: "center", strKey: "status" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]


  /**get loan table data */
  getLoanTableFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getloan/', { id: 'sample' }, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        response.loandetails.map((obj: { [x: string]: any; }, index: number) => {
          obj['slNo'] = index + 1
        })

        this.arrList = response.loandetails
        console.log(this.arrList);
        this.Loader = false;
      }

      else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }
  /**get loan table data */


  /**delete loan */
  deleteLoanFn(loanId: number, employeeId: string) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/delete_loan/', { id: loanId, employeeid: employeeId }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.showSuccess(response.message);
          this.getLoanTableFn();
          setTimeout(() => {
            this.reloadCurrentPage();
          }, 1000);
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }

  dltLoan() {
    this.deleteLoanFn(this.LoanId, this.EmployeeId);
    this.deleteModal = false;
  }

  /**delete loan */


  singleviewloan(loan: any) {
    this.router.navigateByUrl('superadmin/singleview-loan');
    sessionStorage.setItem("id", loan.id);
    sessionStorage.setItem("LoanNo", loan.loanNo);
    sessionStorage.setItem("EmpID", loan.employeeid);

    console.log('ids to session', loan.loanNo, loan.employeeid);

  }



  editloan(loan: any) {
    this.router.navigateByUrl('superadmin/edit-loan');
    sessionStorage.setItem("id", loan.id);
    sessionStorage.setItem("LoanNo", loan.loanNo);
    sessionStorage.setItem("EmpID", loan.employeeid);

  }

  showDeleteDialog() {
    this.deleteModal = true
  }


  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        console.log(objEvent.objElement.id)
        const id = objEvent.objElement.id;
        const loanNo = objEvent.objElement.loanNo;
        const empid = objEvent.objElement.employeeid;


        this.router.navigate(['/superadmin/addeditloan'], {
          queryParams: { id: id, empid: empid, loanNo: loanNo },
        });
        break;

      case 'SINGLEVIEW_DATA':
        this.singleviewloan(objEvent.objElement);
        console.log(objEvent.objElement)
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement)
        this.LoanId = objEvent.objElement.id;
        this.EmployeeId = objEvent.objElement.employeeid;
        break;

      default:
        break;
    }
  }



  reloadCurrentPage() {
    window.location.reload();
  }


  // Error handling methods remain unchanged
  private handleErrorResponse(response: any) {
    if (response['response'] === 'Error') {
      this.showError(response.message);
      setTimeout(() => {
        this.Loader = false; // Hide loader after 1.5 seconds
      }, 1500);
    } else {
      this.showWarning(response.message);
      this.Loader = false;
    }
  }

  private handleHttpError(error: any) {
    if (error.status === 401) {
      this.showError('Invalid token. Please log in again.');
      setTimeout(() => {
        this.router.navigateByUrl('login');
      }, 1500);
    } else {
      this.showError('Unable to process your request at the moment. Please try again later.');
      setTimeout(() => {
        this.Loader = false; // Hide loader after 12 seconds
      }, 12000);
    }
  }

  showSuccess(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'success',
      title: message
    });
  }

  showError(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'error',
      title: message
    });
  }

  showWarning(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'warning',
      title: message
    });
  }



}
