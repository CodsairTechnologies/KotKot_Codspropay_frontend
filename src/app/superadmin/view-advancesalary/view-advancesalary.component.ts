import { ApiService } from '../../core/services/api.service';
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
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-view-advancesalary',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
    CommonModule, NgSelectModule, PaginatorModule, RouterModule,
    FormsModule],
  templateUrl: './view-advancesalary.component.html',
  styleUrl: './view-advancesalary.component.css'
})
export class ViewAdvancesalaryComponent {
  first = 0;
  rows = 20;

  deleteCountryModal: boolean = false;

  id: any
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;
  blnForDelete: boolean = true;
  salaryID: any;
  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = true;

  Loanid: any;

  Delete_ID: any;

  constructor(private router: Router, private formbuilder: FormBuilder, private apiService: ApiService, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");
    this.getAdSalaryTableFn()
  }


  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Emp ID", strAlign: "center", strKey: "employeeId" },
    { strHeader: "Emp Name", strAlign: "center", strKey: "employeename" },
    { strHeader: "Paid Date", strAlign: "center", strKey: "advancedate" },
    { strHeader: "Salary Month", strAlign: "center", strKey: "date" },
    { strHeader: "Advance Amount", strAlign: "center", strKey: "advanceamount" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]


  arrList: any = [];



  /**get loan table data */
  getAdSalaryTableFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/get_advancesalary_list/', { id: 'sample' }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        this.arrList = response['advanceemployeelist']
        response.advanceemployeelist.map((obj: { [x: string]: any; }, index: number) => {
          obj['slNo'] = index + 1
        })
        console.log(this.arrList);
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



  /**delete designation */
  dltAdSalaryFn() {
 
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/deleteadvancesalary/', { id: this.salaryID }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        this.toastrService.showSuccess(response.message)
        this.getAdSalaryTableFn();
        this.deleteCountryModal = false;
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

  deleteDesignationFn() {
    this.dltAdSalaryFn();
  }


  showDeleteDialog() {
    this.deleteCountryModal = true
  }



  singleviewadsalarry(value: any) {
    sessionStorage.setItem("advanceid", value.advanceid.toString());
    sessionStorage.setItem("empid", value.empid);
    console.log('ids to session', value.advanceid, value.empid);
    this.router.navigateByUrl('superadmin/singleview-advancesalary');
  }



  editadsalary(value: any) {
    sessionStorage.setItem("advanceid", value.advanceid.toString());
    sessionStorage.setItem("empid", value.empid);
    this.router.navigateByUrl('superadmin/edit-advancesalary');
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



  eventFromTable(objEvent: any) {
    console.log('Event Object:', objEvent);
    console.log('Event Object Element:', objEvent.objElement);

    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        console.log(objEvent.objElement.advanceid)
        const id = objEvent.objElement.advanceid;
        const empid = objEvent.objElement.employeeId;

        this.router.navigate(['/superadmin/addeditadvancesalary'], {
          queryParams: { id: id, empid: empid },
        });
        break;


      case 'SINGLEVIEW_DATA':
        this.singleviewadsalarry(objEvent.objElement);
        console.log(objEvent.objElement);
        console.log(objEvent.objElement.advanceid);
        console.log(objEvent.objElement.employeeId);

        break;

      case 'DELETE_DATA':
        this.showDeleteDialog();
        console.log(objEvent.objElement.advanceid);
        this.salaryID = objEvent.objElement.advanceid;
        break;

      default:
        break;
    }
  }


  reloadCurrentPage() {
    window.location.reload();
  }

}
