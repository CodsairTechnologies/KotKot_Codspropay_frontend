import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';


@Component({
  selector: 'app-workshift-employee',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule, ButtonModule, PaginatorModule],
  templateUrl: './workshift-employee.component.html',
  styleUrl: './workshift-employee.component.css'
})
export class WorkshiftEmployeeComponent {
  WorkShiftFilterForm!: FormGroup;

  showInputRow: boolean = false;

  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;
  shiftlist: any = [];
  unitlist: any = [];
  departments: any = [];
  shiftnameslist: any = [];

  unitID: any;
  deptId: any;
  shiftID: any;

  WshiftID: any

  deleteCountryModal: boolean = false;
  EditModal: boolean | undefined;

  EmployeefilterForm!: FormGroup;
  arrList: any = []
  Companylist: any = [];

  CompanyID: any;
  first = 0;
  rows = 10;

  Delete_id: any

  /*** boolean key for actions*/
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = false;
  /*** boolean key for actions*/

  workId: any;
  worklocationlist: any = [];


  constructor(private router: Router, private formbuilder: FormBuilder, private http: HttpClient, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {


    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");

    this.WorkShiftFilterForm = this.formbuilder.group({

      Location: [''],
      Department: [''],
      Shift: [''],
      searchOption: ['name'],
      searchKeyword: ['']

    });
    this.getEmpWorkShiftTableFn();
    this.getWorklocationByStatusFn();
    this.getDepartmentByStatusFn();
    this.fetchShiftnamesFn();
  }

  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Emp ID", strAlign: "center", strKey: "employeeId" },
    { strHeader: "Name", strAlign: "center", strKey: "name" },
    { strHeader: "Shift", strAlign: "center", strKey: "shiftname" },
    { strHeader: "Work Location", strAlign: "center", strKey: "worklocation" },
    { strHeader: "Department", strAlign: "center", strKey: "departmentname" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },
  ]

  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
  }


  selectWorkLocation(event: any) {
    this.workId = event.target.value;
    // this.getEmpWorkShiftTableFn();

  }

  getWorklocationByStatusFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post<any>(environment.apiUrl + '/api/getactiveworklocation/', { id: 'sample' }, { headers: reqHeader })
      .subscribe({
        next: (response) => {
          this.Loader = false;
          if (response.response === 'Success') {
            this.worklocationlist = response.worklocationlist;
          } else {
            this.toastrService.showError(response.message);
          }
        },
        error: (error) => {
          this.Loader = false;
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      });
  }

  selectByDepartment(event: any, action: any) {
    this.deptId = event.target.value;
    console.log("Selected Department ID:", this.deptId);
    // this.getEmpWorkShiftTableFn();

  }

  getDepartmentByStatusFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/getactivedepartment/', { id: 'sample' }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response.response === 'Success') {
          this.departments = response.departmentlist;
        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        // Pass Loader reference to common service
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
      );
  }


  // get shift name

  selectByShift(event: any, action: any) {
    this.shiftID = event.target.value;
    // this.getFilterShiftTableFn()

  }

  fetchShiftnamesFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getworkshift/', { id: 'sample' }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        this.shiftnameslist = response.workshiftlist
      }
      else {
        this.handleErrorResponse(response);
      }
    },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }



  /** Filter */

  getFilterShiftTableFn() {
    var reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + this.token
    });

    const filters = {
      worklocationid: this.WorkShiftFilterForm.get('Location')!.value,
      departmentid: this.WorkShiftFilterForm.get('Department')!.value,
      shiftid: this.WorkShiftFilterForm.get('Shift')!.value
    };

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/filteremployeewithshift/', filters, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response.response == 'Success') {
          this.arrList = response.employees;
          console.log(this.shiftlist);
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }





  /**get workshift table */

  getEmpWorkShiftTableFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getactiveemployeesbyshift/', { id: 'sample' }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        response.employees.forEach((obj: { [x: string]: any; }, index: number) => {
          obj['slNo'] = index + 1; // Add serial number
        });
        this.arrList = response['employees']
        console.log(this.shiftlist);
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
  // search

  searchWorkShiftFn() {
    const searchOption = this.WorkShiftFilterForm.get('searchOption')?.value;
    const searchKeyword = this.WorkShiftFilterForm.get('searchKeyword')?.value;

    if (!searchKeyword) {
      this.getEmpWorkShiftTableFn();
      return;
    }

    const payload = {
      option: searchOption,
      word: searchKeyword
    };

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getemployeesbyshiftbyid/', payload, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] == 'Success') {
          this.shiftlist = response['employees'];
          console.log(this.shiftlist);
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  resetInputField() {
    this.WorkShiftFilterForm.get('searchKeyword')?.reset();
    this.getEmpWorkShiftTableFn();

  }

  onInputChange() {
    const searchKeyword = this.WorkShiftFilterForm.get('searchKeyword')?.value?.trim();

    if (!searchKeyword) {
      this.getEmpWorkShiftTableFn();
    }
  }


  // delete workshift

  dltWorkShiftFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/deleteemployeeshift/', { workshiftid: this.WshiftID }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        this.toastrService.showSuccess(response.message);
        // this.reloadCurrentPage();
        this.getEmpWorkShiftTableFn();
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




  // edit(value: any) {
  //   sessionStorage.setItem("id", value)
  //   this.router.navigate(['superadmin/edit-workshift'])
  // }





  showDeleteDialog() {
    this.deleteCountryModal = true
  }

  emp_id: any;

  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        console.log(objEvent.objElement.id)
        const id = objEvent.objElement.id;
        this.router.navigate(['/superadmin/edit-workshift'], {
          queryParams: { id: id },
        });
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement)
        this.WshiftID = objEvent.objElement.id;
        break;


      default:
        break;
    }
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

  reloadCurrentPage() {
    window.location.reload();
  }
  // success- error message

}
