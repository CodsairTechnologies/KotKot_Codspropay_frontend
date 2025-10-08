import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';


@Component({
  selector: 'app-edit-workshift',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule, ButtonModule, PaginatorModule],
  templateUrl: './edit-workshift.component.html',
  styleUrl: './edit-workshift.component.css'
})
export class EditWorkshiftComponent {


  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;
  Workshift_Id: any;
  WorkShiftFilterForm!: FormGroup;
  selectedShiftId: any;
  showInputRow: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [10, 20, 50, 100];
  allSelected: boolean = true;

  shiftnameslist: any = [];
  isReadOnly = true;
  id: any;
  shiftlist: any[] = [

  ];

  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {

    // this.id = sessionStorage.getItem("id");


    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");



    this.route.queryParams.subscribe((params) => {
      this.id = params['id'];

      if (this.id) {
        this.getShiftbyIdTableFn(this.id);
      }
    });

    this.fetchShiftNames();


  }

  get paginatedShiftList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.shiftlist.slice(startIndex, endIndex);
  }

  resetInputField() {
    this.WorkShiftFilterForm.get('searchKeyword')?.reset();
  }


  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }


  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
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
          this.Loader = false;
          this.shiftnameslist = response.workshiftlist;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.handleHttpError(error); // Handle HTTP errors
      })
  }


  getShiftbyIdTableFn(id: any) {
    var reqHeader = new HttpHeaders({
      Authorization: 'Bearer ' + this.token
    });



    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/activeemployeeshiftbyid/', { shiftid: id }, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response.response == 'Success') {
          this.shiftlist = response.employee;
          this.Loader = false;
          // this.Workshift_Id = this.shiftlist[0].workshiftid
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


  updateShift(event: any, item: any): void {
    this.selectedShiftId = event.target.value;

    this.updateEmpShiftFn(this.selectedShiftId);
  }


  // update shift from table

  updateEmpShiftFn(selectedShiftId: number) {
    // if (!selectedWorkShiftId || !selectedShiftId || !this.token) {
    //   console.error('Missing required parameters');
    //   return;
    // }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const updateData = {
      shiftid: selectedShiftId,
      workshiftid: this.id
    };

    console.log('Selected Shift ID:', this.selectedShiftId);
    console.log('Selected Workshift ID:', this.id);

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/editemployeeshift/', updateData, { headers: reqHeader }).subscribe(
      (response: any) => {
        if (response['response'] === 'Success') {
          this.showSuccess(response.message);
          this.getShiftbyIdTableFn(this.id);
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
