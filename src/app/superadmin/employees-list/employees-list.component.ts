import { ApiService } from '../../core/services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import * as bootstrap from 'bootstrap';
import Swal from 'sweetalert2';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule, ButtonModule],
  templateUrl: './employees-list.component.html',
  styleUrl: './employees-list.component.css'
})
export class EmployeesListComponent {
  deleteCountryModal: boolean = false;
  EditModal: boolean | undefined;

  showInputRow: boolean = false;

  EmployeefilterForm!: FormGroup;
  Loader: boolean = false;
  token: any;
  arrList: any = []
  Companylist: any = [];
  departments: any = [];

  CompanyID: any;
  deptId: any;
  first = 0;
  rows = 10;

  Delete_id: any

  /*** boolean key for actions*/
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = true;
  blnHasProfile: boolean = false;

  /*** boolean key for actions*/
  isExpiry: any;


  constructor(private router: Router, private formBuilder: FormBuilder, private apiService: ApiService, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.EmployeefilterForm = this.formBuilder.group({

      Company: ['', Validators.required],
      Department: ['', Validators.required],
      Status: ['', Validators.required],
      Role: ['', Validators.required],
      Search: ['', Validators.required],

      searchOption: ['name'],
      searchKeyword: ['']
    })

    this.get_AllStaff();
    // this.fetchCompanyFn();

  }


  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Emp ID", strAlign: "center", strKey: "employeeId" },
    { strHeader: "Name", strAlign: "center", strKey: "name" },
    { strHeader: "Role", strAlign: "center", strKey: "type" },

    // { strHeader: "Mobile No", strAlign: "center", strKey: "contactNo" },
    // { strHeader: "Company", strAlign: "center", strKey: "unitname" },
    { strHeader: "Department", strAlign: "center", strKey: "department_name" },
    { strHeader: "Status", strAlign: "center", strKey: "strStatus" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]





  // get all employee

  get_AllStaff() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployee/', { id: 'sample' }).subscribe(
      (response: any) => {
        this.Loader = false; // Turn off loader after response
        if (response['response'] === 'Success') {
          response.employeelist.forEach((obj: { [key: string]: any }, index: number) => {
            obj['slNo'] = index + 1;
          });
          this.arrList = response.employeelist;
        } else {
          this.handleErrorResponse(response); // Handle errors or warnings
        }
      },
      (error) => {
        this.Loader = false; // Turn off loader in case of HTTP error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Use common HTTP error handling
      }
    );
  }

  toggleInputRow() {
    this.showInputRow = !this.showInputRow;
  }






  selectCompany(event: any, action: any) {
    this.CompanyID = event.target.value;
    console.log("Selected Company ID:", this.CompanyID);
    this.fetchDepartmentByCompanyId();

  }



  fetchCompanyFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getunit/', { id: 'sample' })
      .subscribe((response: any) => {
        this.Loader = false; // Hide loader initially
        if (response['response'] === 'Success') {
          this.Companylist = response.unitlist;
        } else {
          this.handleErrorResponse(response);
        }
      }, error => {
        this.Loader = false; // Hide loader in case of error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      });
  }

  selectByDepartment(event: any, action: any) {
    this.deptId = event.target.value;
    console.log("Selected Department ID:", this.deptId);
    // this.getEmpWorkShiftTableFn();
  }

  fetchDepartmentByCompanyId(callback?: () => void) {
 

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getdepartmentbyunit/', { unitid: this.CompanyID })
      .subscribe((response: any) => {
        this.Loader = false; // Hide loader initially
        if (response['response'] === 'Success') {
          this.departments = response['departments'];
          if (callback) callback();
        } else {
          this.handleErrorResponse(response);
        }
      }, error => {
        this.Loader = false; // Hide loader in case of error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      });
  }




  resetInputField() {
    this.EmployeefilterForm.get('searchKeyword')?.reset();
    this.get_AllStaff();

  }

  onInputChange() {
    const searchKeyword = this.EmployeefilterForm.get('searchKeyword')?.value?.trim();

    if (!searchKeyword) {
      // If the input field is cleared, display all data
      this.get_AllStaff();
    }
  }

  // search
  searchEmpFn() {
    const searchOption = this.EmployeefilterForm.get('searchOption')?.value;
    const searchKeyword = this.EmployeefilterForm.get('searchKeyword')?.value;

    if (!searchKeyword) {
      this.get_AllStaff();
      return;
    }

    const payload = {
      option: searchOption,
      word: searchKeyword
    };
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/employeesearch/', payload)
      .subscribe(
        (response: any) => {
          this.Loader = false; // Hide loader initially
          if (response['response'] === 'Success') {
            response.employee_list.forEach((obj: { [x: string]: any; }, index: number) => {
              obj['slNo'] = index + 1; // Add serial number
            });
            this.arrList = response['employee_list'];
            console.log(this.arrList);
          } else if (response['response'] === 'Warning') {
            this.arrList = []
            this.handleErrorResponse(response);
          }
        },
        error => {
          this.Loader = false; // Hide loader in case of error
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      );
  }



  /** Filter */

  getFilterEmpTableFn() {
     
    const filters = {
      unit: this.EmployeefilterForm.get('Company')!.value,
      department: this.EmployeefilterForm.get('Department')!.value,
      status: this.EmployeefilterForm.get('Status')!.value,
      role: this.EmployeefilterForm.get('Role')!.value

    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/employeefilter/', filters).subscribe(
      (response: any) => {
        this.Loader = false; // Hide loader initially
        if (response.response === 'Success') {
          response.employee_list.forEach((obj: { [x: string]: any; }, index: number) => {
            obj['slNo'] = index + 1; // Add serial number
          });
          this.arrList = response.employee_list;
          console.log(this.arrList);
        } else if (response['response'] === 'Warning') {
          this.handleErrorResponse(response);
          this.arrList = []; // Clear the array if there's an error or warning
        }
      },
      (error) => {
        this.Loader = false; // Hide loader in case of error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
    );
  }



  selectexpiryStatus(event: any, action: any) {
    this.isExpiry = event.target.value;
    console.log("Selected status:", this.isExpiry);
    this.ExpiryFilterEmpFn();
  }


  // search
  ExpiryFilterEmpFn() {

    const payload = {
      isexpiry: this.isExpiry,
    };


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/expiryemployeefilter/', payload)
      .subscribe(
        (response: any) => {
          this.Loader = false; // Hide loader initially
          if (response['response'] === 'Success') {
            response.employeelist.forEach((obj: { [x: string]: any; }, index: number) => {
              obj['slNo'] = index + 1; // Add serial number
            });
            this.arrList = response['employeelist'];
            console.log(this.arrList);
          } else if (response['response'] === 'Warning') {
            this.arrList = []
            this.handleErrorResponse(response);
          }
        },
        error => {
          this.Loader = false; // Hide loader in case of error
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      );
  }


  dltEmpFn(item: any, item1 :any) {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/deleteemployee/', { id: item , employeeid : item1}).subscribe(
      (response: any) => {
        this.Loader = false; // Hide loader immediately upon response
        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.reloadCurrentPage();
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader in case of error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP error
      }
    );
  }


  deleteVehicle() {
    this.dltEmpFn(this.Delete_id, this.emp_id);
    this.deleteCountryModal = false;
    this.get_AllStaff()
  }



  singleviewEmployee(value: any) {
    sessionStorage.setItem("singleviewid", value);
    this.router.navigateByUrl('superadmin/singleview-employee')
  }



  toggleActiveINactive(id: number, newStatus: string) {
    const payload = { id: id, status: newStatus };
 
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/statusemployee/', payload).subscribe(
      (response: any) => {
        this.Loader = false; // Turn off loader after receiving the response
        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.get_AllStaff(); // Refresh the list after status change
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Turn off loader in case of error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP error using common error function
      }
    );
  }


  profileEmployee(value: { employeeId: string; id: string }) {
    // Store the id in session storage
    sessionStorage.setItem("profileid", value.id);

    // Navigate using the employeeId as the 'value' route parameter
    this.router.navigate(['superadmin/employee-profile', value.employeeId]);

    console.log('Employee ID passed for navigation:', value.employeeId);
    console.log('Profile ID stored in session storage:', value.id);
  }


  clearfilter() {
    this.EmployeefilterForm.reset({
      Company: '',
      Department: '',
      Status: '',
      Role: '',

      searchOption: 'name',
      searchKeyword: ''
    });
    this.get_AllStaff();
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



  selectedFile: File | null = null;

  openUploadModal() {
    const modalEl = document.getElementById('uploadModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      console.error('Modal element not found');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.toastrService.showError('Please select an Excel file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/employeeupload/', formData)
      .subscribe(
        (response: any) => {
          this.Loader = false;

          if (response.response === 'Success') {
            if (response.failed && response.failed.length > 0) {
              // Partial success
              let errorMsg = 'Some employees failed to upload:\n';
              response.failed.forEach((item: any) => {
                errorMsg += `Row ${item.row}: ${item.error}\n`;
              });
              this.toastrService.showError(errorMsg);
            } else {
              // Full success
              this.toastrService.showSuccess('File uploaded successfully!');
            }

            // Close modal
            this.closeUploadModal();

            // Refresh list
            this.ExpiryFilterEmpFn();
          }
          else if (response.response === 'Error') {
            let errorMsg = 'Upload failed for these rows:\n';
            response.failed.forEach((item: any) => {
              errorMsg += `Row ${item.row}: ${item.error}\n`;
            });
            this.toastrService.showError(errorMsg);
          }
          else if (response.response === 'Warning') {
            this.handleErrorResponse(response);
          }
        },
        error => {
          this.Loader = false;
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      );
  }

  private closeUploadModal() {
    const modalEl = document.getElementById('uploadModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
  }









  showDeleteDialog() {
    this.deleteCountryModal = true
  }
  showModalDialog(value: any) {
    sessionStorage.setItem("editid", value);
    this.router.navigateByUrl('superadmin/edit-employee')
  }
  emp_id: any;

  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'EDIT_DATA':
        console.log(objEvent.objElement.id)
        const id = objEvent.objElement.id;
        const empid = objEvent.objElement.employeeId;

        this.router.navigate(['/superadmin/addemployees'], {
          queryParams: { id: id, empid: empid },
        });
        break;

      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement)
        this.Delete_id = objEvent.objElement.id;
        this.emp_id = objEvent.objElement.employeeId;

        break;

      case 'SINGLEVIEW_DATA':
        this.singleviewEmployee(objEvent.objElement.id)
        console.log(objEvent.objElement)
        break;

      case 'PROFILE_DATA':
        this.profileEmployee(objEvent.objElement)
        console.log(objEvent.objElement)
        break;

      case 'TOGGLETABLE_DATA':
        // this.showDeleteDialog()
        const newStatus = objEvent.objElement.toggle ? 'Active' : 'Inactive';
        this.toggleActiveINactive(objEvent.objElement.id, newStatus);
        console.log(objEvent.objElement)
        break;

      default:
        break;
    }
  }

  reloadCurrentPage() {
    window.location.reload();
  }
}
