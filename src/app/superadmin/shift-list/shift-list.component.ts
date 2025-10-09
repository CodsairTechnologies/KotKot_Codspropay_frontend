import { ApiService } from '../../core/services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule, ButtonModule],
  templateUrl: './shift-list.component.html',
  styleUrl: './shift-list.component.css'
})
export class ShiftListComponent {

  addShiftForm!: FormGroup;
  EditShiftForm!: FormGroup
  EditModal: boolean = false;
  deleteCountryModal: boolean = false;


  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;
  arrList: any = [];

  unitID: any;
  deptId: any;
  shiftId: any;
  unitlist: any = [];
  departments: any = [];
  shiftList: any = [];

  constructor(private router: Router, private formbuilder: FormBuilder, private apiService: ApiService, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");

    this.addShiftForm = this.formbuilder.group({

      shift: ['', Validators.required],
      punchin: [''],
      punchout: [''],
      Breaktime: ['']
    });

    this.EditShiftForm = this.formbuilder.group({
      shift: ['', Validators.required],
      punchin: [''],
      punchout: [''],
      Breaktime: ['']
    });


    this.getShiftTableFn();
  }



  first = 0;
  rows = 10;



  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Shift", strAlign: "center", strKey: "shift" },
    { strHeader: "Punch In", strAlign: "center", strKey: "punchin" },
    { strHeader: "Punch Out", strAlign: "center", strKey: "punchout" },
    { strHeader: "Break Time", strAlign: "center", strKey: "break_duration" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]

  /*** boolean key for actions*/
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = true;
  /*** boolean key for actions*/




  /**get Shift table */

  getShiftTableFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getworkshift/', { id: 'sample' }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.arrList = response.workshiftlist.map((item: any, index: number) => ({
          ...item,
          slNo: index + 1,
          punchin: this.secondsToHHMM(Number(item.punchin)),
          punchout: this.secondsToHHMM(Number(item.punchout)),

        }));
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  secondsToHHMM(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**add shift  */

  addShiftFn() {

    if (this.addShiftForm.invalid) {
      this.addShiftForm.markAllAsTouched();
      return;
    }
    var formdata = new FormData();

    formdata.append('shift', this.addShiftForm.controls['shift'].value);
    formdata.append('punchin', this.addShiftForm.controls['punchin'].value);
    formdata.append('punchout', this.addShiftForm.controls['punchout'].value);
    formdata.append('break_duration', this.addShiftForm.controls['Breaktime'].value);

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/addworkshift/', formdata).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.toastrService.showSuccess(response.message);
        this.getShiftTableFn();
        this.reloadCurrentPage();
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  /**add Shift */


  // shift by id

  getShiftById(id: any) {
    this.shiftId = id.toString();


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getworkshiftbyid/', { id: this.shiftId }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.shiftList = response['worklist'];

        if (this.shiftList.length > 0) {
          const shift = this.shiftList[0];

          // Convert punchin and punchout from seconds to HH:mm format
          const punchinFormatted = this.secondsToHHMM(Number(shift.punchin));
          const punchoutFormatted = this.secondsToHHMM(Number(shift.punchout));

          // Update form controls with the formatted values
          this.EditShiftForm.patchValue({
            shift: shift.shift,

            punchin: punchinFormatted,
            punchout: punchoutFormatted,
            Breaktime: shift.break_duration
          });


        }
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }


  editShift() {

    var formdata = new FormData();

    formdata.append('shift', this.EditShiftForm.controls['shift'].value);
    // formdata.append('unitId', this.unitID);
    // formdata.append('departmentId', this.deptId);
    formdata.append('punchin', this.EditShiftForm.controls['punchin'].value);
    formdata.append('punchout', this.EditShiftForm.controls['punchout'].value);
    formdata.append('break_duration', this.EditShiftForm.controls['Breaktime'].value);
    formdata.append('id', this.shiftId);


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/editworkshift/', formdata).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {
        this.toastrService.showSuccess(response.message);
        this.getShiftTableFn();
        this.reloadCurrentPage();
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }


  deleteShiftFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/deleteworkshift/', { id: this.shiftId }).subscribe(
      (response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          // this.getKmRangeTableFn();
          this.reloadCurrentPage();

        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  dltShift() {
    this.deleteShiftFn();
    this.deleteCountryModal = false; // Close the delete confirmation dialog
  }


  // Status Active & Inactive Fn //

  toggleActiveINactive(id: number, newStatus: string) {
    const payload = {
      id: id,
      status: newStatus
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/statusworkshift/', payload).subscribe(
      (response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.getShiftTableFn(); // Refresh the table data
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  toggleTableData(rowData: any, event: any) {
    const newStatus = event.target.checked ? 'Active' : 'Inactive';
    this.toggleActiveINactive(rowData.id, newStatus);
  }

  clearall() {
    this.addShiftForm.reset();
  }


  onModalHidden() {
    this.reloadCurrentPage()
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
        this.shiftId = objEvent.objElement.id
        this.getShiftById(this.shiftId)
        console.log(objEvent.objElement)
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        this.shiftId = objEvent.objElement.id
        console.log(objEvent.objElement)
        break;

      case 'TOGGLETABLE_DATA':
        const newStatus = objEvent.objElement.toggle ? 'Active' : 'Inactive';
        this.toggleActiveINactive(objEvent.objElement.id, newStatus);
        console.log(objEvent.objElement)
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

}
