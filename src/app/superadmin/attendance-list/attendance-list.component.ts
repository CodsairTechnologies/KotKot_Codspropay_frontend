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

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
    CommonModule, NgSelectModule, PaginatorModule,
    FormsModule],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {

  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  currentPage = 1;
  itemsPerPage = 15;
  itemsPerPageOptions = [15, 25, 50, 100];

  selectedAttendanceFile: File | null = null;
  selectedDailyAttendanceFile: File | null = null;
  selectedOvertimeFile: File | null = null;
  selectedIncentiveFile: File | null = null;

  AddForm!: FormGroup
  EditForm!: FormGroup
  AddDailyForm!: FormGroup;
  attendancelist: any = [];
  dailyattendancelist: any = [];

  AttendanceID: any;
  selectedAttFile: string = '';
  selectedOTFile: string = '';
  selectedIncFile: string = '';
  selectedAttendanceId: number | null = null;
  selectedOtId: number | null = null;

  submitted = false;

  apiurl: any = environment.apiUrl;

  Isot: string | undefined;
  Isincentive: string | undefined;
  selectedItemId: any;

  AttendancebyidList: any = [];
  AttendanceById_List: any = [];
  month: any;
  year: any;


  attendanceFileFromServer: any;
  overtimeFileFromServer: any;
  incentiveFileFromServer: any;
  attendance: any;


  selectedAttendanceFileName: string = '';
  selectedDailyAttendanceFileName: string = '';
  selectedotFileName: string = '';
  selectedIncentiveFileName: string = '';


  Employeelist: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  showDropdown = false;
  showCloseIcon: boolean = false;
  empid: any;
  empbyidListlist: any = [];

  employeeid: any;
  currentDate: string = '';
  constructor(private router: Router, private formbuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {


    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");


    // this.getEmpWorkShiftTableFn();
    const currentYear = new Date().getFullYear();


    const today = new Date();
    // Format the date to 'yyyy-mm-dd'
    this.currentDate = today.toISOString().split('T')[0];
    console.log('Formatted date:', this.currentDate);


    this.AddForm = this.formbuilder.group({
      attendanceFile: [null, Validators.required],
      month: [''],
      year: [currentYear, [Validators.required, Validators.min(1900), Validators.max(2099)]]
    });

    this.AddDailyForm = this.formbuilder.group({
      attendanceFile: [null, Validators.required],
      date: [''],
    });



    this.EditForm = this.formbuilder.group({
      attendanceFile: [null, Validators.required],
      month: [''],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2099)]]
    });


    this.getAttendanceTableFn();

    this.filteredEmployees = [...this.Employeelist];



  }


  getFormattedDate(): string {
    const date = new Date(this.currentDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }






  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  @HostListener('document:click', ['$event'])


  clickOutside(event: Event) {
    if (this.showDropdown && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  filterEmployees(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.filteredEmployees = this.Employeelist.filter(employee =>
      employee.employeename.toLowerCase().includes(filterValue)
    );
    this.showDropdown = this.filteredEmployees.length > 0 || filterValue.length > 0;
    this.showCloseIcon = filterValue.length > 0 || !!this.selectedEmployee;
  }





  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;

    if (this.showDropdown) {
      this.filteredEmployees = this.Employeelist;
    }
  }


  onInputChange(event: any) {
    const inputValue = event.target.value;
    this.showCloseIcon = inputValue.length > 0 || !!this.selectedEmployee;
  }


  /**get empname for dropdown */
  getEmployeeNameFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getofficestaff/', { id: 'sample' }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.Employeelist = response.employeelist;
          this.filteredEmployees = this.Employeelist;
        } else {
          this.handleErrorResponse(response);
        }
      },
        (error) => {
          this.Loader = false;
          this.handleHttpError(error);
        })
  }
  /**END get empname for dropdown */




  // Monthly
  get paginatedattendance() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.attendancelist.slice(startIndex, endIndex);
  }

  // Daily
  get paginatedDailyAttendance() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.dailyattendancelist.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }

  onDailyPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }


  view(item: any) {
    sessionStorage.setItem("attendanceid", item.attendanceid);
    sessionStorage.setItem("otid", item.otid || ''); // Handle cases where otid might be null or undefined

    this.router.navigate(['superadmin/view-attendance']);
  }

  viewdailypunchin(item: any) {
    sessionStorage.setItem("dailyattendanceid", item.attendanceid);

    this.router.navigate(['superadmin/viewdailypunchin']);
  }


  onAttendanceUpload(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validExtensions = ['xls', 'xlsx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (validExtensions.includes(fileExtension!)) {
        this.selectedDailyAttendanceFile = file;
        this.selectedDailyAttendanceFileName = file.name;
      } else {
        this.showError('Please upload a valid Excel file (.xls or .xlsx).');
        event.target.value = ''; // Clear the file input
        this.selectedDailyAttendanceFileName = 'No file selected';
        this.selectedDailyAttendanceFile = null;
      }
    }
  }

  // Upload file selection handler for attendance file
  onFileSelected1(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validExtensions = ['xls', 'xlsx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (validExtensions.includes(fileExtension!)) {
        this.selectedAttendanceFile = file;
        this.selectedAttendanceFileName = file.name;
      } else {
        this.showError('Please upload a valid Excel file (.xls or .xlsx).');
        event.target.value = ''; // Clear the file input
        this.selectedAttendanceFileName = 'No file selected';
        this.selectedAttendanceFile = null;
      }
    }
  }

  onFileSelected2(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validExtensions = ['xls', 'xlsx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (validExtensions.includes(fileExtension!)) {
        this.selectedOvertimeFile = file;
        this.selectedotFileName = file.name;
        console.log("Selected overtime file:", this.selectedOvertimeFile);
      } else {
        this.showError('Please upload a valid Excel file (.xls or .xlsx).');
        event.target.value = ''; // Clear the file input
        this.selectedotFileName = 'No file selected';
        this.selectedOvertimeFile = null;
      }
    }
  }

  onFileSelected3(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validExtensions = ['xls', 'xlsx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (validExtensions.includes(fileExtension!)) {
        this.selectedIncentiveFile = file;
        this.selectedIncentiveFileName = file.name;
        console.log("Selected incentive file:", this.selectedIncentiveFile);
      } else {
        this.showError('Please upload a valid Excel file (.xls or .xlsx).');
        event.target.value = ''; // Clear the file input
        this.selectedIncentiveFileName = 'No file selected';
        this.selectedIncentiveFile = null;
      }
    }
  }





  /**get Attendance table */

  getAttendanceTableFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/getattendance/', { id: 'sample' }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.attendancelist = response['attendancelist'];
          if (this.attendancelist.length > 0) {
            this.selectedAttFile = this.attendancelist[0].attendancefile;
            this.selectedOTFile = this.attendancelist[0].otfile;
            // this.selectedIncFile = this.attendancelist[0].incentivefile;

            this.Isot = this.attendancelist[0].Isot;
            this.Isincentive = this.attendancelist[0].Isincentive;

          }
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
        (error) => {
          this.Loader = false; // Hide loader on error
          this.handleHttpError(error); // Handle HTTP errors
        })
  }


  getDailyAttendanceTableFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/getdailyattendance/', { id: 'sample' }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.dailyattendancelist = response['attendancelist'];
          if (this.attendancelist.length > 0) {
            this.selectedAttFile = this.attendancelist[0].attendancefile;
          }
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
        (error) => {
          this.Loader = false; // Hide loader on error
          this.handleHttpError(error); // Handle HTTP errors
        })
  }


  /**add File */

  addAttendanceFileFn() {

    if (!this.selectedAttendanceFile) {
      this.showError('Please select attendance file before submitting')
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.AddForm.invalid) {
      this.AddForm.markAllAsTouched();
      return;
    }

    const formdata = new FormData();

    if (this.selectedAttendanceFile) {
      formdata.append('attendance', this.selectedAttendanceFile);
    }

    if (this.selectedOvertimeFile) {
      formdata.append('ot', this.selectedOvertimeFile);
    }

    if (this.selectedIncentiveFile) {
      formdata.append('incentives', this.selectedIncentiveFile);
    }

    formdata.append('month', this.AddForm.controls['month'].value);
    formdata.append('year', this.AddForm.controls['year'].value);

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/attendanceupload/', formdata, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {

          this.showSuccess(response.message);
          // this.getAttendanceTableFn();
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

  getFileNameFromUrl(url: string): string {
    return url ? url.split('/').pop() || 'No file selected' : 'No file selected';
  }




  get_AttendanceById(month: any, year: any) {

    this.month = month;
    this.year = year;

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + 'codspropay/api/singleviewattendance/', { month: this.month, year: this.year }, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          this.Loader = false;
          if (response['response'] === 'Success') {
            this.AttendanceById_List = response['attendancelist'];

            this.attendance = this.AttendanceById_List[0];


            // Store the file data from server
            this.attendanceFileFromServer = this.attendance.attendancefile;
            this.overtimeFileFromServer = this.attendance.otfile;
            this.incentiveFileFromServer = this.attendance.incentivefile;


            // this.EditForm.controls['attendanceFile'].setValue(this.AttendanceById_List[0].attendancefile);
            // this.EditForm.controls['overtimeFile'].setValue(this.AttendanceById_List[0].otfile);
            // this.EditForm.controls['incentiveFile'].setValue(this.AttendanceById_List[0].incentive);
            this.EditForm.controls['month'].setValue(this.AttendanceById_List[0].month);
            this.EditForm.controls['year'].setValue(this.AttendanceById_List[0].year);

            this.selectedAttendanceFileName = this.getFileNameFromUrl(this.attendance.attendancefile);
            this.selectedotFileName = this.getFileNameFromUrl(this.attendance.otfile);
            this.selectedIncentiveFileName = this.getFileNameFromUrl(this.attendance.incentivefile);


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


  // Edit attendance file function


  // Utility function to fetch binary data from URL
  private async fetchFileAsBinary(url: string): Promise<Blob | null> {
    try {
      const response = await this.http.get(url, { responseType: 'blob' }).toPromise();
      return response instanceof Blob ? response : null; // Ensure response is a Blob or return null
    } catch (error) {
      console.error("Failed to fetch file:", error);
      return null; // Return null if fetch fails
    }
  }


  async editAttendanceFileFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const formdata = new FormData();

    // Attendance file
    if (this.selectedAttendanceFile) {
      formdata.append('attendance', this.selectedAttendanceFile);
    } else if (this.attendanceFileFromServer) {
      const attendanceBinary = await this.fetchFileAsBinary(environment.apiUrl + this.attendanceFileFromServer);
      if (attendanceBinary) {
        formdata.append('attendance', attendanceBinary, this.getFileNameFromUrl(this.attendanceFileFromServer));
      } else {
        formdata.append('attendance', 'undefined');
      }
    } else {
      formdata.append('attendance', 'undefined');
    }

    // Overtime file
    if (this.selectedOvertimeFile) {
      formdata.append('ot', this.selectedOvertimeFile);
    } else if (this.overtimeFileFromServer) {
      const otBinary = await this.fetchFileAsBinary(environment.apiUrl + this.overtimeFileFromServer);
      if (otBinary) {
        formdata.append('ot', otBinary, this.getFileNameFromUrl(this.overtimeFileFromServer));
      } else {
        formdata.append('ot', 'undefined');
      }
    } else {
      formdata.append('ot', 'undefined');
    }

    // Incentive file
    if (this.selectedIncentiveFile) {
      formdata.append('incentives', this.selectedIncentiveFile);
    } else if (this.incentiveFileFromServer) {
      const incentiveBinary = await this.fetchFileAsBinary(environment.apiUrl + this.incentiveFileFromServer);
      if (incentiveBinary) {
        formdata.append('incentives', incentiveBinary, this.getFileNameFromUrl(this.incentiveFileFromServer));
      } else {
        formdata.append('incentives', 'undefined');
      }
    } else {
      formdata.append('incentives', 'undefined');
    }

    // Append month and year
    formdata.append('month', this.EditForm.controls['month'].value);
    formdata.append('year', this.EditForm.controls['year'].value);

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/attendancefileedit/', formdata, { headers: reqHeader })
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




  deleteType: any;

  // delete attendance

  setDeleteIds(item: any, type: 'monthly' | 'daily') {
    this.selectedAttendanceId = item.attendanceid || item.id;
    this.selectedOtId = item.otid || null;
    this.deleteType = type;
  }

  deleteAttendance() {
    if (this.deleteType === 'daily') {
      this.dltDailyAttendanceFn();
    } else {
      this.dltAttendanceFn();
    }
  }


  dltAttendanceFn() {
    if (this.selectedAttendanceId === null) {
      console.error('No IDs selected for deletion.');
      return;
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/deleteattendance/', {
      attendancefileid: this.selectedAttendanceId,
      otfileid: this.selectedOtId
    }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.reloadCurrentPage();
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }

  dltDailyAttendanceFn() {
    if (this.selectedAttendanceId === null) {
      console.error('No IDs selected for deletion.');
      return;
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/deletedailyattendance/', {
      id: this.selectedAttendanceId,
    }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.showSuccess(response.message);
        this.reloadCurrentPage();
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }


  setDownloadIds(item: any) {
    this.selectedItemId = item.attendanceid;
    this.selectedAttFile = item.attendancefile;
    console.log(this.selectedItemId, this.selectedAttFile);
    this.downloadFile('manual'); // ✅ fixed lowercase
  }

  downloadFile(type: string) {
    let fileUrl: string = '';
    let fileName: string = '';

    if (type === 'manual') {
      fileName = this.selectedAttFile;
      console.log(fileName);
    }

    fileUrl = `${this.apiurl}${fileName}`;
    console.log('Attendance File URL:', fileUrl);

    if (fileUrl) {
      window.open(fileUrl, '_blank'); // ✅ opens file in new tab
    } else {
      console.error('File URL is not defined');
    }
  }


  addDailyAttendanceFileFn() {

    if (!this.selectedDailyAttendanceFile) {
      this.showError('Please select attendance file before submitting.....')
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.AddDailyForm.invalid) {
      this.AddDailyForm.markAllAsTouched();
      return;
    }

    const formdata = new FormData();

    if (this.selectedDailyAttendanceFile) {
      formdata.append('file', this.selectedDailyAttendanceFile);
    }


    formdata.append('date', this.AddDailyForm.controls['date'].value);

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/dailypunchupload/', formdata, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {

          this.showSuccess(response.message);
          // this.getAttendanceTableFn();
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


  onModalHidden() {
    this.reloadCurrentPage();
  }

  reloadCurrentPage() {
    window.location.reload();
  }


}
