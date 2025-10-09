import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';


@Component({
  selector: 'app-ot-punch',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule],
  templateUrl: './ot-punch.component.html',
  styleUrl: './ot-punch.component.css'
})
export class OtPunchComponent {
  deleteCountryModal: boolean = false;
  EditModal: boolean = false;
  addDepartmentForm!: FormGroup;
  EditDepartmentForm!: FormGroup;
  EmployeefilterForm!: FormGroup;

  deptID: any;
  Loader: boolean = false;
  token: any;
  Company_ArrayList: any = [];
  arrList: any = []
  SelectedCompany: any;
  DeptID: any;
  DeptId_List: any = [];
  Delete_DeptID: any;
  CompanyId: any;
  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router,
    private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    // this.get_AllCompanys();
    this.get_Employees();
    this.fetchDepartment();

    this.addDepartmentForm = this.formbuilder.group({

      Company: ['', Validators.required],
      department: ['', Validators.required]
    });

    this.EditDepartmentForm = this.formbuilder.group({
      ECompany: ['', Validators.required],
      Edepartment: ['', Validators.required]
    });


    this.EmployeefilterForm = this.formbuilder.group({
      Department: [''],
      startDate: ['']
    });
  }



  first = 0;
  rows = 10;



  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Employee Name", strAlign: "center", strKey: "employeename" },
    { strHeader: "Department", strAlign: "center", strKey: "departmentname" },
    { strHeader: "Date", strAlign: "center", strKey: "date" },
    { strHeader: "Punch In", strAlign: "center", strKey: "punchin" },
    { strHeader: "Punch Out", strAlign: "center", strKey: "punchout" },
    { strHeader: "OT Hour", strAlign: "center", strKey: "othour" },


    // { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]

  /*** boolean key for actions*/
  blnHasSingleview: boolean = false;
  blnForDelete: boolean = false;
  blnNoEdit: boolean = false;
  /*** boolean key for actions*/


  Selected_Company(event: any, action: any) {
    this.SelectedCompany = event.target.value;
    console.log(this.SelectedCompany)
  }

  showInputRow: boolean = false;
  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
  }






  departments: any = [];
  deptId: any;

  fetchDepartment() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/getactivedepartment/', { id: 'sample' }, { headers: reqHeader })
      .subscribe({
        next: (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            this.departments = response['unitlist'];
          } else {
            this.handleErrorResponse(response);
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
    this.applyFilter();
  }

  applyFilter() {
    const filterValues = this.EmployeefilterForm.value;
    const payload = {
      departmentid: filterValues.Department || null,
      date: filterValues.startDate || null
    };

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/getotemployees/', payload, { headers: reqHeader })
      .subscribe({
        next: (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            if (response['message'] === 'No data found' || !response.employees || response.employees.length === 0) {
              this.arrList = [];
              this.toastrService.showError(response.message || 'No data found');
            } else {
              response.employees.forEach((obj: { [key: string]: any }, index: number) => {
                obj['slNo'] = index + 1;
              });
              this.arrList = response.employees;
              console.log('Filtered employees:', this.arrList);
            }
          } else {
            this.arrList = [];
            this.toastrService.showError(response.message || 'Something went wrong');
            this.handleErrorResponse(response.message);
          }

        },
        error: (error) => {
          this.Loader = false;
          this.arrList = [];
          this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      });
  }

  clearFilter() {
    this.reloadCurrentPage();
  }

  get_Employees() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getotemployees/', {}, { headers: reqHeader })
      .subscribe({
        next: (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            if (response['message'] === 'No data found' || !response.employees || response.employees.length === 0) {
              this.arrList = [];
            } else {
              response.employees.forEach((obj: { [key: string]: any }, index: number) => {
                obj['slNo'] = index + 1;
              });
              this.arrList = response.employees;
              console.log('All employees:', this.arrList);
            }
          } else {
            this.arrList = [];
            this.handleErrorResponse(response.message);
          }
        },
        error: (error) => {
          this.Loader = false;
          this.arrList = [];
          this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      });
  }




  // Error handling methods
  private handleErrorResponse(response: any) {
    if (response['response'] === 'Error') {
      this.toastrService.showError(response.message);
      setTimeout(() => {
        this.Loader = false; // Hide loader after 12 seconds
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





  onModalHidden() {
    this.reloadCurrentPage();
  }

  reloadCurrentPage() {
    window.location.reload();
  }



  showDeleteDialog() {
    this.deleteCountryModal = true
  }
  showModalDialog() {
    this.EditModal = true;
  }


  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.showModalDialog()
        console.log(objEvent.objElement.id)
        this.DeptID = objEvent.objElement.id;
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement.id)
        this.Delete_DeptID = objEvent.objElement.id;
        break;

      default:
        break;
    }
  }

}
