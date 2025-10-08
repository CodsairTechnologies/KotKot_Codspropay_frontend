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


@Component({
  selector: 'app-assign-workshift',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule, ButtonModule, PaginatorModule],
  templateUrl: './assign-workshift.component.html',
  styleUrl: './assign-workshift.component.css'
})
export class AssignWorkshiftComponent {
  WorkShiftFilterForm!: FormGroup;

  showInputRow: boolean = false;

  allSelected: boolean = false;

  currentPage = 1;
  itemsPerPage = 15;
  itemsPerPageOptions = [15, 25, 50, 100];

  shiftlist: any = [];


  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;
  deptId: any;
  shiftId: any;
  departments: any = [];
  shiftList: any = [];

  shiftbydept: any = [];
  shiftnameslist: any = [];

  CheckedValue: any;

  shiftID: any

  selectedShiftId: any
  selectedWorkshiftId: any

  b = 0;

  shiftArray: any = []
  Workshift_Id: any;
  shiftValue: any;
  constructor(private router: Router, private formbuilder: FormBuilder, private http: HttpClient) { }

  // Array declaration
  shiftArr = [
    { id: '', worklocationid: '', departmentid: '', added_by: '', shiftid: '', empid: '', employeeid: '', isShift: '' },
  ];

  deleteArr = [
    { id: '', empid: '', isShift: '' },
  ];


  selectedshiftID: any;
  worklocationlist: any = [];


  isChecked: any;
  workId: any;

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");


    this.WorkShiftFilterForm = this.formbuilder.group({
      Location: ['', Validators.required],
      Department: ['', Validators.required],
      Shift: ['', Validators.required],

      searchOption: ['name'],
      searchKeyword: ['']
    });

    this.getWorklocationByStatusFn();
    this.fetchShiftNames();
    this.getShiftTableFn();

    this.getDepartmentByStatusFn()
  }


  get paginatedPaymentList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.shiftlist.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }

  selectWorkLocation(event: any) {
    this.workId = event.target.value;
    this.getFilterShiftTableFn();

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
            this.showError(response.message);
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
    this.getFilterShiftTableFn();

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
          this.showError(response.message);
        }
      }, (error) => {
        // Pass Loader reference to common service
        this.handleHttpError(error);
      }
      );
  }

  selectShift(event: any) {
    this.shiftID = event.target.value;
    console.log(this.shiftID);
  }



  // Fetch shift names from API

  fetchShiftNames() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getworkshift/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response['response'] == 'Success') {
          this.shiftnameslist = response.workshiftlist;
          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }

  getShiftTableFn() {
    var reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + this.token
    });

    const filters = {
      worklocationid: null,
      departmentid: null,
      shiftid: null
    };

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/filteremployeewithoutshift/', filters, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response.response == 'Success') {
          this.shiftlist = response.employees;
          this.Workshift_Id = this.shiftlist[0].workshiftid
          console.log(this.shiftlist);
          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }



  /**get Shift table */


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
    this.http.post(environment.apiUrl + 'codspropay/api/filteremployeewithoutshift/', filters, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response.response == 'Success') {
          this.shiftlist = response.employees;
          this.Workshift_Id = this.shiftlist[0].workshiftid
          console.log(this.shiftlist);
          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.shiftlist =[];
        this.handleHttpError(error); // Handle HTTP errors
      })
  }

  // search

  searchWorkShiftFn() {
    const searchOption = this.WorkShiftFilterForm.get('searchOption')?.value;
    const searchKeyword = this.WorkShiftFilterForm.get('searchKeyword')?.value;

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
        if (response['response'] == 'Success') {
          this.Loader = false;
          this.shiftlist = response['employees'];
          console.log(this.shiftlist);
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }

  resetInputField() {
    this.WorkShiftFilterForm.get('searchKeyword')?.reset();
    this.getShiftTableFn()
  }


  updateShift(event: any, item: any): void {
    const selectedValue = event.target.value.split('+');
    const selectedShiftId = selectedValue[0];
    const selectedWorkshiftId = selectedValue[1];

    console.log('Selected Shift ID:', selectedShiftId);
    console.log('Selected Workshift ID:', selectedWorkshiftId);

    this.updateEmpShiftFn(selectedShiftId, selectedWorkshiftId);
  }


  // update shift from table

  updateEmpShiftFn(selectedShiftId: number, selectedWorkShiftId: number) {
    if (!selectedWorkShiftId || !selectedShiftId || !this.token) {
      console.error('Missing required parameters');
      return;
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const updateData = {
      shiftid: selectedShiftId,
      workshiftid: selectedWorkShiftId
    };

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/editemployeeshift/', updateData, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response['response'] === 'Success') {
          this.reloadCurrentPage()

          this.getFilterShiftTableFn();
          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }



  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
  }


  // array function



  Checked(event: any, action: any, values: { id: string, worklocationid: string, departmentid: string, shiftid: string, empid: string, employeeid: string }) {
    this.isChecked = (event.target as HTMLInputElement).checked;
    console.log(this.isChecked);
    if (action === 'add') {
      if (this.isChecked) {
        this.shiftValue = 'Yes';
        if (this.b === 0) {
          this.shiftArr = [];
          this.deleteArr = [];
          this.b++;
        }
        this.shiftArr.unshift({
          id: values.id,
          worklocationid: values.worklocationid,
          departmentid: values.departmentid,
          added_by: this.adminid,
          shiftid: this.shiftID,
          isShift: 'No',
          empid: values.empid,
          employeeid: values.employeeid,
        });
      }
      else {
        console.log('inside else ')
        const index = this.shiftArr.findIndex(item =>
          //item.id === values.id &&
          item.worklocationid === values.worklocationid &&
          item.departmentid === values.departmentid &&
          //item.shiftid === values.shiftid &&
          item.empid === values.empid &&
          item.employeeid === values.employeeid
        );
        console.log(index)
        if (index > -1) {
          this.shiftArr.splice(index, 1);
        }
      }
    }
    else if (action === 'del') {
      console.log('del');
      if (this.b === 0) {
        this.shiftArr = [];
        this.deleteArr = [];
        this.b++;
      }
      if (!this.isChecked) {
        this.shiftValue = 'No';
        this.deleteArr.unshift({
          id: values.id,
          empid: values.empid,
          isShift: this.shiftValue,
        });
      }
      else {
        const index = this.deleteArr.findIndex(item =>
          item.id === values.id &&
          item.empid === values.empid
        );

        if (index > -1) {
          this.deleteArr.splice(index, 1);
        }
      }
    }

    console.log(this.shiftArr);
    console.log('######');
    console.log(this.deleteArr);
  }


  // Assign workshift


  assignWorkshift() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    var formdata = new FormData();

    this.shiftArr = this.shiftArr.map(item => ({
      ...item,
      shiftid: this.shiftID
    }));

    const payload = {
      addlist: this.shiftArr,
      deletelist: this.deleteArr
    };

    formdata.append('addlist', JSON.stringify(this.shiftArr));
    formdata.append('deletelist', JSON.stringify(this.deleteArr));
    console.log('######$$$$$')
    console.log(this.shiftArr)

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/addemployeesbyshift/', formdata, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;
      if (response.response === 'Success') {
        this.showSuccess(response.message);
        this.router.navigateByUrl('/superadmin/workshift')

      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }



  // name sort

  nameSortFn(sortOrder: string) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const payload = {
      word: sortOrder,
      worklocationid: this.workId,
      departmentid: this.deptId || null,
      shiftid: null
    };

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/employeenamesort/', payload, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response['response'] === 'Success') {
          this.shiftlist = response['employees'];
          console.log(this.shiftlist);
          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }



  // checked sort

  checkSortFn(sortOrder: string) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const payload = {
      word: sortOrder,
      worklocationid: this.workId,
      departmentid: this.deptId || null,
      shiftid: null
    };

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/employeechecksort/', payload, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response['response'] === 'Success') {
          this.shiftlist = response['employees'];
          console.log(this.shiftlist);
          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
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

  // success- error message


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
