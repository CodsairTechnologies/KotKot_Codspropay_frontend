import { ApiService } from '../../core/services/api.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginatorModule } from 'primeng/paginator';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
@Component({
  selector: 'app-addoredit-loan',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
    CommonModule, NgSelectModule, PaginatorModule,
    FormsModule],
  templateUrl: './addoredit-loan.component.html',
  styleUrl: './addoredit-loan.component.css'
})
export class AddoreditLoanComponent {

  addLoanForm!: FormGroup;
  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  EmpId: any;
  DriverId: any;
  rangeId: any;
  addKm: any
  empID: any
  empid: any
  vehiclenamelist: any = [];
  empbyidListlist: any = [];

  selectedRange: any;

  Employeelist: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  showDropdown = false;
  showCloseIcon: boolean = false;
  isEditMode: boolean = false;
  loanbyidList: any = [];
  id: any;
  loanNo: any;


  constructor(private formBuilder: FormBuilder, private router: Router, private apiService: ApiService, private route: ActivatedRoute, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");

    if (!this.token) {
      this.toastrService.showError('Token not available. Please log in again.');
      this.router.navigateByUrl('/login');
      return;
    }


    this.addLoanForm = this.formBuilder.group({
      Name: ['', Validators.required],
      EmpId: [''],
      Salary: [''],
      Department: [''],
      Unit: [''],

      Date: [''],
      Amount: [''],
      Emi: [''],
      Repayment: [''],
      Closuredate: [''],

    })

    this.filteredEmployees = [...this.Employeelist];
    this.getEmployeeNameFn();


    this.addLoanForm.get('Repayment')?.valueChanges.subscribe(() => {
      this.calculateClosureDate();
    });

    this.addLoanForm.get('Amount')?.valueChanges.subscribe(() => {
      this.calculateClosureDate();
    });

    this.addLoanForm.get('Emi')?.valueChanges.subscribe(() => {
      this.calculateClosureDate();
    });


    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const empid = params['empid'];
      const loanNo = params['loanNo'];

      this.isEditMode = !!(id);
      if (id) {
        this.getLoanByIdFn(id, loanNo, empid);
      }
    });
  }
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  @HostListener('document:click', ['$event'])


  clickOutside(event: Event) {
    if (this.showDropdown && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }




  }


  getLoanByIdFn(loanID: string, loanNo: string, EmployeeID: string) {

    this.id = loanID
    this.loanNo = loanNo;

    this.Loader = true;
    this.apiService.postData(environment.apiUrl + 'codspropay/api/getloanbyid/', { id: loanID, loanNo: loanNo, employeeid: EmployeeID }).subscribe((response: any) => {
      if (response.response === 'Success') {
        this.Loader = false;
        this.loanbyidList = response['loanDetails'];
        if (this.loanbyidList && this.loanbyidList.length > 0) {
          const loan = this.loanbyidList[0];

          this.addLoanForm.controls['Name'].setValue(loan.employeename);
          this.addLoanForm.controls['EmpId'].setValue(loan.employeeid);
          this.addLoanForm.controls['Salary'].setValue(loan.basicsalary);
          this.addLoanForm.controls['Department'].setValue(loan.department_name);
          this.addLoanForm.controls['Unit'].setValue(loan.unitname);
          this.addLoanForm.controls['Date'].setValue(loan.date);
          this.addLoanForm.controls['Amount'].setValue(loan.amount);
          this.addLoanForm.controls['Emi'].setValue(loan.emiamount);
          this.addLoanForm.controls['Repayment'].setValue(loan.repaymentdate);
          this.addLoanForm.controls['Closuredate'].setValue(loan.closuredate);


        } else {
          console.log('No data found.');
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

  calculateClosureDate() {
    const amount = this.addLoanForm.get('Amount')?.value;
    const emi = this.addLoanForm.get('Emi')?.value;
    const repaymentDate = this.addLoanForm.get('Repayment')?.value;

    if (amount && emi && repaymentDate) {
      const months = Math.ceil(amount / emi);
      const repayment = new Date(repaymentDate);
      const closureDate = new Date(repayment.setMonth(repayment.getMonth() + months));
      this.addLoanForm.get('Closuredate')?.setValue(closureDate.toISOString().split('T')[0]);
    } else {
      this.addLoanForm.get('Closuredate')?.setValue('');
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

  selectEmployee(employee: any) {
    this.selectedEmployee = employee;
    this.filteredEmployees = [];
    this.showDropdown = false;
    this.addLoanForm.patchValue({ Name: employee.employeename });
    this.addLoanForm.get('Name')?.markAsTouched();
    this.addLoanForm.get('Name')?.updateValueAndValidity();

    this.getEmpDeatilsByIdFn(employee.empid);
    this.empid = employee.empid;

    console.log('employee id', employee.empid);

    this.showCloseIcon = true;
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;

    if (this.showDropdown) {
      this.filteredEmployees = this.Employeelist;
    }
  }

  clearSelection() {
    this.selectedEmployee = null;
    this.filteredEmployees = this.Employeelist;
    this.showDropdown = false;

    // Clear form fields
    this.addLoanForm.patchValue({
      Name: '',
      EmpId: '',
      Salary: '',
      Department: '',
      Unit: ''
    });
    this.addLoanForm.get('Name')?.markAsTouched();
    this.addLoanForm.get('Name')?.updateValueAndValidity();

    this.showCloseIcon = false;
  }

  onInputChange(event: any) {
    const inputValue = event.target.value;
    this.showCloseIcon = inputValue.length > 0 || !!this.selectedEmployee;
  }

  getEmployeeNameFn() {
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployeedetails/', { id: 'sample' })
      .subscribe((response: any) => {
        if (response['response'] === 'Success') {
          this.Employeelist = response.employeelist;
          this.filteredEmployees = this.Employeelist;
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

  /**get empname for dropdown */



  getEmpDeatilsByIdFn(empid: any) {

    this.empID = empid.toString();
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployeebyid/', { id: this.empID }).subscribe((response: any) => {
      if (response.response === 'Success') {
        this.Loader = false;
        this.empbyidListlist = response['employeelist'];
        if (this.empbyidListlist && this.empbyidListlist.length > 0) {
          const employee = this.empbyidListlist[0];

          this.addLoanForm.controls['EmpId'].setValue(employee.employeeId);
          this.addLoanForm.controls['Salary'].setValue(employee.basicsalary);
          this.addLoanForm.controls['Department'].setValue(employee.department_name);
          // this.addLoanForm.controls['Unit'].setValue(employee.unitname);

        } else {
          console.log('No vehicle found.');
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


  /** get Loan by id*/

  getEmpLoanByIdFn(empid: any) {

    this.empID = empid.toString();

    this.Loader = true;
    this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployeebyid/', { id: this.empID }).subscribe((response: any) => {
      if (response.response === 'Success') {
        this.Loader = false;
        this.empbyidListlist = response['employeelist'];
        if (this.empbyidListlist && this.empbyidListlist.length > 0) {
          const employee = this.empbyidListlist[0];

          this.addLoanForm.controls['EmpId'].setValue(employee.employeeId);
          this.addLoanForm.controls['Salary'].setValue(employee.basicsalary);
          this.addLoanForm.controls['Department'].setValue(employee.departmentname);
          this.addLoanForm.controls['Unit'].setValue(employee.unitname);


        } else {
          console.log('No vehicle found.');
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
  /** get Loan By id*/





  /**add Loan function */

  addLoanFn() {

    if (this.addLoanForm.invalid) {
      this.addLoanForm.markAllAsTouched();
      return;
    }
    const formdata = new FormData();

    if (this.isEditMode && this.id) {
      formdata.append('id', this.id);
      formdata.append('loanNo', this.loanNo);

    }

    formdata.append('empid', this.empid);
    formdata.append('employeeid', this.addLoanForm.controls['EmpId'].value);
    formdata.append('date', this.addLoanForm.controls['Date'].value);
    formdata.append('amount', this.addLoanForm.controls['Amount'].value);
    formdata.append('emiamount', this.addLoanForm.controls['Emi'].value);
    formdata.append('repaymentdate', this.addLoanForm.controls['Repayment'].value);
    formdata.append('closuredate', this.addLoanForm.controls['Closuredate'].value);

    this.Loader = true;

    const apiUrl = this.isEditMode
      ? environment.apiUrl + 'codspropay/api/editloan/'
      : environment.apiUrl + 'codspropay/api/addloan/';

    this.apiService.postData(apiUrl, formdata).subscribe((response: any) => {
      this.Loader = false;
      if (response.response === 'Success') {
        this.toastrService.showSuccess(response.message);
        this.addLoanForm.reset();
        this.router.navigateByUrl('superadmin/loanview');
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  /**add Loan function */



  reloadCurrentPage() {
    window.location.reload();
  }

  clearForm(): void {
    this.addLoanForm.reset();
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

}
