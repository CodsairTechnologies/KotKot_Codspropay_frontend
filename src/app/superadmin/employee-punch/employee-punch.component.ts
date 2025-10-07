import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-employee-punch',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule],
  templateUrl: './employee-punch.component.html',
  styleUrl: './employee-punch.component.css'
})
export class EmployeePunchComponent {
  deleteCountryModal: boolean = false;
  EditModal: boolean = false;
  addDepartmentForm!: FormGroup;
  EditDepartmentForm!: FormGroup;
  EmployeefilterForm!: FormGroup;
  employeeSearchForm!: FormGroup;

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
  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router) { }

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
      EemployeeName: [{ value: '', disabled: true }, Validators.required], // read-only
      Edepartment: [{ value: '', disabled: true }, Validators.required], // read-only
      Edate: [{ value: '', disabled: true }, Validators.required], // read-only
      Echeckin: ['', Validators.required], // editable
      Echeckout: ['', Validators.required] // editable
    });



    this.EmployeefilterForm = this.formbuilder.group({
      Department: [''],
      startDate: ['']
    });

    this.employeeSearchForm = this.formbuilder.group({
      empName: [''],
      month: ['']
    });
  }



  first = 0;
  rows = 10;



  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Emp ID", strAlign: "center", strKey: "employeeid" },
    { strHeader: "Employee Name", strAlign: "center", strKey: "employeename" },
    { strHeader: "Department", strAlign: "center", strKey: "departmentname" },
    { strHeader: "Date", strAlign: "center", strKey: "indate" },
    { strHeader: "Punch In", strAlign: "center", strKey: "checkin" },
    { strHeader: "Punch Out", strAlign: "center", strKey: "checkout" },
    { strHeader: "Working Hour", strAlign: "center", strKey: "workinghour" },
    { strHeader: "OT Hour", strAlign: "center", strKey: "othour" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]

  /*** boolean key for actions*/
  blnHasSingleview: boolean = false;
  blnForDelete: boolean = false;
  blnNoEdit: boolean = true;
  /*** boolean key for actions*/


  Selected_Company(event: any, action: any) {
    this.SelectedCompany = event.target.value;
    console.log(this.SelectedCompany)
  }

  showInputRow: boolean = false;
  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
  }

  get_AllCompanys() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/getunit/', { id: 'sample' }, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            this.Company_ArrayList = response['unitlist'];
          } else {
            this.handleErrorResponse(response);
          }
        },
        (error) => {
          this.Loader = false;
          this.handleHttpError(error);
        }
      );
  }

  addDepartment() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.addDepartmentForm.invalid) {
      this.addDepartmentForm.markAllAsTouched();
      return;
    }

    const formdata = new FormData();
    formdata.append('unitId', this.SelectedCompany);
    formdata.append('departmentname', this.addDepartmentForm.controls['department'].value);

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/adddepartment/', formdata, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            this.showSuccess(response.message);
            setTimeout(() => this.reloadCurrentPage(), 1000);
          } else {
            this.handleErrorResponse(response);
          }
        },
        (error) => {
          this.Loader = false;
          this.handleHttpError(error);
        }
      );
  }

  editDepartment() {
    if (this.EditDepartmentForm.invalid) {
      this.EditDepartmentForm.markAllAsTouched();
      return;
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const payload = {
      id: this.DeptID,
      checkin: this.EditDepartmentForm.get('Echeckin')?.value,
      checkout: this.EditDepartmentForm.get('Echeckout')?.value
    };

    this.http.post(environment.apiUrl + 'codspropay/api/editemployeepunch/', payload, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          if (response.response === 'Success') {
            this.EditModal = false;
            this.get_Employees();
            this.showSuccess(response.message);
          } else {
            this.handleErrorResponse(response);
          }
        },
        (error) => {
          this.handleHttpError(error);
        }
      );
  }


  getById() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/viewemployeepunchbyid/', { id: this.DeptID }, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            const emp = response['employees'][0];

            this.EditDepartmentForm.patchValue({
              EemployeeName: emp.employeename,
              Edepartment: emp.departmentname,
              Edate: emp.indate,
              Echeckin: emp.checkin,
              Echeckout: emp.checkout
            });
          } else {
            this.handleErrorResponse(response);
          }
        },
        (error) => {
          this.Loader = false;
          this.handleHttpError(error);
        }
      );
  }


  deleteDepartment() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/deletedepartment/', { id: this.Delete_DeptID }, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            this.showSuccess(response.message);
            setTimeout(() => {
              this.reloadCurrentPage();
            }, 1000);
          } else {
            this.handleErrorResponse(response);
          }
        },
        (error) => {
          this.Loader = false;
          this.handleHttpError(error);
        }
      );
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
          this.handleHttpError(error);
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
    this.http.post(environment.apiUrl + 'codspropay/api/getemployeepunch/', payload, { headers: reqHeader })
      .subscribe({
        next: (response: any) => {
          this.Loader = false;
          if (response.response === 'Success') {
            response.employees.forEach((obj: any, index: number) => {
              obj.slNo = index + 1;
            });
            this.arrList = response.employees;
            console.log('All employees:', this.arrList);

          } else if (response.response === 'Warning') {
            this.arrList = [];
            this.showWarning(response.message || 'No data found');

          } else {
            this.arrList = [];
            this.showError(response.message || 'Something went wrong');
            this.handleErrorResponse(response.message);
          }

        },
        error: (error) => {
          this.Loader = false;
          this.arrList = [];
          this.handleHttpError(error);
        }
      });
  }

  clearFilter() {
    this.reloadCurrentPage();
  }

  clearSearch() {
    this.employeeSearchForm.reset();
    this.get_Employees();
  }

  // clearSearch() {
  //   this.employeeSearchForm.reset();
  //   this.reloadCurrentPage();
  // }


  SearchFn() {
    const filterValues = this.employeeSearchForm.value;

    // Validation: both Employee Name and Month are required
    if (!filterValues.empName || !filterValues.month) {
      this.showError('Please enter both Employee Name and Month to search.');
      return;
    }

    const payload = {
      monthyear: filterValues.month,
      empname: filterValues.empName
    };

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/searchemployeepunch/', payload, { headers: reqHeader })
      .subscribe({
        next: (response: any) => {
          this.Loader = false;

          if (response.response === 'Success') {
            response.employees.forEach((obj: any, index: number) => {
              obj.slNo = index + 1;
            });
            this.arrList = response.employees;
            console.log('All employees:', this.arrList);

          } else if (response.response === 'Warning') {
            this.arrList = [];
            this.showWarning(response.message || 'No data found');

          } else {
            this.arrList = [];
            this.showError(response.message || 'Something went wrong');
            this.handleErrorResponse(response.message);
          }

        },
        error: (error) => {
          this.Loader = false;
          this.arrList = [];
          this.handleHttpError(error);
        }
      });
  }

  get_Employees() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getemployeepunch/', {}, { headers: reqHeader })
      .subscribe({
        next: (response: any) => {
          this.Loader = false;

          if (response.response === 'Success') {
            response.employees.forEach((obj: any, index: number) => {
              obj.slNo = index + 1;
            });
            this.arrList = response.employees;
            console.log('All employees:', this.arrList);

          } else if (response.response === 'Warning') {
            this.arrList = [];
            this.showWarning(response.message || 'No data found');

          } else {
            this.arrList = [];
            this.showError(response.message || 'Something went wrong');
            this.handleErrorResponse(response.message);
          }
        },
        error: (error) => {
          this.Loader = false;
          this.arrList = [];
          this.showError('Server error. Please try again.');
          this.handleHttpError(error);
        }
      });
  }





  // Error handling methods
  private handleErrorResponse(response: any) {
    if (response['response'] === 'Error') {
      this.showError(response.message);
      setTimeout(() => {
        this.Loader = false; // Hide loader after 12 seconds
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
        this.getById();
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
