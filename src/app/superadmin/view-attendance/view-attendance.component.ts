import { ApiService } from '../../core/services/api.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { PaginatorModule } from 'primeng/paginator';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-view-attendance',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
        CommonModule, PaginatorModule,
        FormsModule],
  templateUrl: './view-attendance.component.html',
  styleUrl: './view-attendance.component.css'
})
export class ViewAttendanceComponent {
 SearchForm!: FormGroup;
  showInputRow: boolean = false;
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;
  totalRecords!: number;


  currentPage: number = 1;
  itemsPerPage: number = 20;
  itemsPerPageOptions: number[] = [20, 30, 40, 50];

  showInnerTable: boolean = false;
  totalWorkInfo: string[] = [];
  nestedTableHeaders: string[] = [];
  nestedTableData: any[] = [];

  attendancelist: any = [];
  nestedattendanceList: any = [];
  AttendanceId: any;
  EmpID: any;

  daysArray: string[] = [];

  workSummary: any[] = [];
  departmentlist: any = [];
  deptId: any;

  attendanceId: string | null = null;
  otId: string | null = null;

  expandedItemId: string | null = null;

  showOtTable: boolean = false; // Initialize showOtTable as false
  otList: any[] = [];

  AddManualForm!: FormGroup;

  Employeelist: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  showDropdown = false;
  showCloseIcon: boolean = false;
  empid: any;

  employeeid: any
  empbyidListlist: any = [];
  date: any

  selectedEmployeeId: any;
  attendanceDetails: any = [];
  inDate: any;

  constructor(private router: Router, private formbuilder: FormBuilder, private apiService: ApiService, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.attendanceId = sessionStorage.getItem("attendanceid");
    this.otId = sessionStorage.getItem("otid");

    console.log(this.AttendanceId);

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");

    this.SearchForm = this.formbuilder.group({
      searchOption: ['name'],
      searchKeyword: [''],
      Department: [''],
      Role: ['']
    });


    this.AddManualForm = this.formbuilder.group({
      Name: ['', Validators.required],
      Holiday: ['', Validators.required],
      attendanceDate: ['', Validators.required],
    });


    this.AddManualForm.valueChanges.subscribe(() => {
      this.calculateOtHours();
    });


    this.getAttendanceTableFn();
    this.fetchDeptFn();
  }


  calculateOtHours() {
    const workingHours = Number(this.AddManualForm.get('workinghours')?.value) || 0;
    const breakHours = Number(this.AddManualForm.get('breaktime')?.value) || 0;

    const inDate = this.AddManualForm.get('inDate')?.value;
    const inTime = this.AddManualForm.get('inTime')?.value;
    const outDate = this.AddManualForm.get('outDate')?.value;
    const outTime = this.AddManualForm.get('outTime')?.value;

    if (inDate && inTime && outDate && outTime) {
      const inDateTime = new Date(`${inDate}T${inTime}`);
      const outDateTime = new Date(`${outDate}T${outTime}`);

      // Calculate difference in minutes
      const diffInMinutes = (outDateTime.getTime() - inDateTime.getTime()) / (1000 * 60);

      if (diffInMinutes >= 0) {
        const totalWorkedHours = diffInMinutes / 60;
        const otHours = Math.max(0, totalWorkedHours - (workingHours + breakHours));
        this.AddManualForm.patchValue({ otHours: otHours.toFixed(2) }, { emitEvent: false });
      } else {
        // Invalid scenario: Out time before in time
        this.AddManualForm.patchValue({ otHours: '' }, { emitEvent: false });
      }
    } else {
      // Missing date or time fields
      this.AddManualForm.patchValue({ otHours: '' }, { emitEvent: false });
    }
  }

  get paginatedList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.attendancelist.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }





  getemployee(empid: any, employeename: any) {
    this.selectedEmployeeId = empid; // Store globally
    this.AddManualForm.reset(); // Optional: Reset the form before editing
    console.log(employeename);

    this.AddManualForm.controls['Name'].setValue(employeename);
  }

  attendanceByiD() {
    this.date = this.AddManualForm.controls['attendanceDate'].value;
    this.employeeid = this.selectedEmployeeId;

    if (this.employeeid && this.date) {
      this.getEmpDetailsFn();
    } else {
      this.toastrService.showWarning('Please select an employee and a date to edit attendance data');
    }
  }



  /**END get empname for dropdown */


  /**get Employee By ID */
  getEmpDetailsFn() {

    this.date = this.AddManualForm.controls['attendanceDate'].value;

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getmanualattendancebyid/', { empid: this.employeeid, currentdate: this.date }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response.response === 'Success') {
          this.attendanceDetails = response['data'];

          if (this.attendanceDetails) {
            this.AddManualForm.controls['Holiday'].setValue(this.attendanceDetails.value);
            this.AddManualForm.controls['Name'].setValue(this.attendanceDetails.empname);
          }
        } else {
          this.handleErrorResponse(response);
        }
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
    );
  }


  addManualAttendanceFn() {

    if (this.AddManualForm.invalid) {
      this.AddManualForm.markAllAsTouched();
      return;
    }

    const formdata = new FormData();
    formdata.append('empid', this.employeeid);
    formdata.append('currentdate', this.AddManualForm.controls['attendanceDate'].value);
    formdata.append('holiday', this.AddManualForm.controls['Holiday'].value);


    this.Loader = true;

     this.apiService.postData(environment.apiUrl + 'codspropay/api/editmanualattendance/', formdata)
      .subscribe(
        (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            this.toastrService.showSuccess(response.message);
            setTimeout(() => {
              this.reloadCurrentPage();
            }, 1000);
          } else {
            this.handleErrorResponse(response);
          }
        },
        (error) => this.handleHttpError(error)
      );
  }


  // department - filter


  selectByDepartment(event: any, action: any) {

    this.SearchForm.patchValue({
      searchKeyword: ''
    });

    this.deptId = event.target.value;
    console.log("Selected Department ID:", this.deptId);
  }

  fetchDeptFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getdepartment/', { id: 'sample' }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        this.departmentlist = response.unitlist
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


  // filter attendance by department

  getFilterAttendanceTableFn() {

    const filters = {
      departmentid: this.SearchForm.get('Department')!.value,
      role: this.SearchForm.get('Role')!.value,

      attendancefileid: this.attendanceId

    };
    console.log('filter attendance', filters);

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/filterattendance/', filters).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response.response == 'Success') {
          this.attendancelist = response.employeeworklist;
          console.log(this.attendancelist);
        } else {
          this.handleErrorResponse(response);
          this.attendancelist = []

        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }



  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
  }

  /**get Attendance table */
  getAttendanceTableFn() {
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/viewattendancelist/',
      { attendancefileid: this.attendanceId }
    ).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.attendancelist = response.employeeworklist;
        this.totalRecords = this.attendancelist.length;
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  toggleInnerTable(empId: string) {
    if (this.expandedItemId === empId) {
      this.expandedItemId = null;
    } else {
      this.expandedItemId = empId;
      this.getNestedTableFn(empId);
    }
  }


  isBoldField(field: string): boolean {
    return ['status', 'intime1', 'outtime1', 'intime2', 'outtime2'].includes(field);
  }



  getNestedTableFn(empId: string) {
    this.EmpID = empId.toString();
    console.log('attendance id', this.EmpID);
    const payload = {
      attendancefileid: this.attendanceId,
      empid: this.EmpID
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/attendancebyid/', payload)
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {


        if (response['ot'] && response['ot'].length > 0) {
  this.workSummary = response['ot'];

  // Extract only date keys (e.g., "Jul 1", "Jul 2", etc.)
  this.daysArray = Object.keys(this.workSummary[0])
    .filter(key => !['type', 'basichour', 'dailywage', 'hourlywage'].includes(key));
}



          // Prepare OT list and check if it should be shown
          if (response['ot'] && response['ot'].some((item: any) => item.field !== undefined)) {
            this.showOtTable = true;
            this.otList = response['ot'] || [];
          } else {
            this.showOtTable = false;
            this.otList = [];
          }

          this.Loader = false;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
        (error) => {
          this.Loader = false; // Hide loader on error
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
        })
  }






  // Search attendance data
  searchAttendanceFn() {
    const searchOption = this.SearchForm.get('searchOption')?.value;
    const searchKeyword = this.SearchForm.get('searchKeyword')?.value?.trim();

    if (!searchKeyword) {
      this.getAttendanceTableFn();
      return;
    }

    const payload = {
      attendancefileid: this.attendanceId,
      option: searchOption,
      word: searchKeyword
    };


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/searchattendance/', payload).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.attendancelist = response.employeeworklist;
          console.log(this.attendancelist);
          this.totalRecords = this.attendancelist.length;
        } else {
          this.handleErrorResponse(response);
          this.attendancelist = []
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  resetInputField() {
    this.SearchForm.get('searchKeyword')?.reset();
    this.getAttendanceTableFn();


  }

  // Handle input field change event
  onInputChange() {
    const searchKeyword = this.SearchForm.get('searchKeyword')?.value?.trim();

    if (!searchKeyword) {
      this.getAttendanceTableFn();
    }

    this.SearchForm.patchValue({
      Department: ''
    });
  }


  onModalHidden() {
    this.reloadCurrentPage();
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
