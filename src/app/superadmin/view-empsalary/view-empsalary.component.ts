import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-view-empsalary',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
        CommonModule, NgSelectModule, PaginatorModule, 
        FormsModule],
  templateUrl: './view-empsalary.component.html',
  styleUrl: './view-empsalary.component.css'
})
export class ViewEmpsalaryComponent {

  deleteModal: boolean | undefined;
  EditModal: boolean | undefined;

  showInputRow: boolean = false;
  SalaryFilterForm!: FormGroup
  ;
  editSalaryForm!: FormGroup
  InventivesForm!: FormGroup

  first = 0;
  rows = 20;

  /*** boolean key for actions*/
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = true;
  /*** boolean key for actions*/

  Unit_ArrayList: any = [];
  unit_Id: any;
  Salary_ArrayList: any = [];
  Dept_ID: any;


  currentPage = 1;
  itemsPerPage = 15;
  itemsPerPageOptions = [15, 25, 50, 100];


  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  driverchargelist: any = [];
  paymentId: any;
  salaryaddeddate: any;
  selectedDeptId: any;

  salaryList: any = [];
  departmentlist: any = [];
  salarydetails: any = [];
  month: any;
  year: any;

  salID: any;
  delID: any;

  selectedItem: any;


  selectedIncentivesFile: File | null = null;


  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");

    this.month = sessionStorage.getItem("month");
    this.year = sessionStorage.getItem("year");

    this.SalaryFilterForm = this.formBuilder.group({
      Department: ['', Validators.required],
      Role: ['', Validators.required],
      search: [''],

    })


    this.editSalaryForm = this.formBuilder.group({
      NightAllowance: ['', Validators.required],
      OtherIncentives: ['', Validators.required],
      PerformanceIncentives: ['', Validators.required]

    })

    this.InventivesForm = this.formBuilder.group({
      Incentives: ['', Validators.required],


    })

    this.get_salarytableFn();
    this.fetdepartmentFn();
  }



  editSalaryFn() {

    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.editSalaryForm.invalid) {
      this.editSalaryForm.markAllAsTouched();
      return;
    }

    const formdata = new FormData();

    formdata.append('nightallowance', this.editSalaryForm.controls['NightAllowance'].value);
    formdata.append('otherincentives', this.editSalaryForm.controls['OtherIncentives'].value);
    formdata.append('performanceincentives', this.editSalaryForm.controls['PerformanceIncentives'].value);
    formdata.append('salaryid', this.salID);


    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/editsalarybymonthbyid/', formdata, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;
      if (response.response === 'Success') {
        this.showSuccess(response.message);
        this.reloadCurrentPage()
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }


  SalarydetailsById(item: any) {
    this.salID = item;

    console.log('id', this.salID);


    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/salarybymonthbyid/', { salaryid: this.salID }, { headers: reqHeader }).subscribe((response: any) => {
      if (response.response === 'Success') {
        this.Loader = false;

        this.salarydetails = response.datas;


        if (this.salarydetails.length > 0) {

          const salary = this.salarydetails[0];

          this.editSalaryForm.controls['NightAllowance'].setValue(salary.nightallowance);
          this.editSalaryForm.controls['OtherIncentives'].setValue(salary.otherincentives);
          this.editSalaryForm.controls['PerformanceIncentives'].setValue(salary.performanceincentives);



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


  onFileSelected(event: any): void {
    const fileNameSpan = document.getElementById('incentive-file-name');
    const file: File = event.target.files[0];

    if (file) {
      const validExtensions = ['xls', 'xlsx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (validExtensions.includes(fileExtension!)) {
        // Valid Excel file
        this.selectedIncentivesFile = file;
        if (fileNameSpan) {
          fileNameSpan.textContent = file.name;
        }
        console.log("Selected incentive file:", this.selectedIncentivesFile);
      } else {
        // Invalid file type
        this.showError('Please upload a valid Excel file (.xls or .xlsx).');
        event.target.value = '';
        if (fileNameSpan) {
          fileNameSpan.textContent = 'No file selected';
        }
        this.selectedIncentivesFile = null;
      }
    }
  }


  uploadFile() {

    if (!this.selectedIncentivesFile) {
      this.showError('Please select incentive file before submitting')
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.InventivesForm.invalid) {
      this.InventivesForm.markAllAsTouched();
      return;
    }

    const formdata = new FormData();

    if (this.selectedIncentivesFile) {
      formdata.append('incentives', this.selectedIncentivesFile);
    }

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/incentiveupload/', formdata, { headers: reqHeader })
      .subscribe((response: any) => {
        if (response['response'] === 'Success') {
          this.showSuccess(response.message);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
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

  inputchange(event: any) {
    this.SalaryFilterForm.patchValue({
      Department: '',
      Role: ''
    });

  }


  selectedDepartment(event: any) {
    this.selectedDeptId = event.target.value;
    this.SalaryFilterForm.patchValue({
      search: ''
    });
  }


  fetdepartmentFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/getdepartment/', { id: 'sample' }, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.departmentlist = response.unitlist
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


  get_salarytableFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    const searchKeyword = this.SalaryFilterForm.get('search')?.value?.trim();
    const role = this.SalaryFilterForm.get('Role')!.value
    const objPayload = {
      month: this.month,
      year: this.year,
      employeeid: searchKeyword,
      departmentid: this.selectedDeptId,
      role: role,

    };


    this.http.post(environment.apiUrl + 'codspropay/api/givensalarybymonth/', objPayload, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Salary_ArrayList = response['datas']
        this.Loader = false;
      }

      else if (response['response'] == 'Error') {
        this.Loader = false;
        this.showError(response.message);
        this.Salary_ArrayList = [];
      } else {
        this.Loader = false;
        this.showWarning(response.message)
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }




  DeleteSal(salaryId: any) {
    this.delID = salaryId;
  }

  /**delete salary */
  deleteSalaryFn() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '', { id: this.delID }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.showSuccess(response.message);

          this.reloadCurrentPage()
          this.get_salarytableFn(); // Refresh the salary table
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }



  get paginatedPaymentList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.Salary_ArrayList.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }

  singleviewEmployee(value: any) {
    this.router.navigateByUrl('super-admin/singlevew-runningcharge')
    sessionStorage.setItem("id", value);
  }

  showDeleteDialog() {
    this.deleteModal = true
  }
  showModalDialog() {
    this.EditModal = true;
    // this.router.navigateByUrl('super-admin/edit-runningcharge')
  }




  setSelectedItem(item: any) {
    this.selectedItem = item;
  }

  confirmPaySalary() {
    if (!this.selectedItem?.salaryid) {
      this.showWarning("No salary ID found.");
      return;
    }

    const payload = { id: this.selectedItem.salaryid };
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/editwithhelbymonth/', payload, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.showSuccess(response.message);
          this.get_salarytableFn(); // Refresh salary table
          this.reloadCurrentPage()

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


  deleteSalary(item: any) {
    const { month, year, empid } = item;

    const payload = {
      month: month,
      year: year,
      employeeid: empid
    };

    console.log("Payload to send:", payload); // Log the payload to the console

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/delete_employee_attendance/', payload, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          if (response['response'] === 'Success') {
            this.Loader = false;
            this.showSuccess(response.message);
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


  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        this.showModalDialog()
        console.log(objEvent.objElement)
        // this.route(objEvent.objElement.Did);
        // this.route(objEvent.objElement.Rid);

        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement)
        break;

      case 'SINGLEVIEW_DATA':
        this.singleviewEmployee(objEvent.objElement.id);

        console.log(objEvent.objElement)
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
