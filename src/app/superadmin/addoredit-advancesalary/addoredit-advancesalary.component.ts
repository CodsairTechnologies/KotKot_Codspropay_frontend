import { ApiService } from '../../core/services/api.service';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-addoredit-advancesalary',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule,
    CommonModule, NgSelectModule,
    FormsModule],
  templateUrl: './addoredit-advancesalary.component.html',
  styleUrl: './addoredit-advancesalary.component.css'
})
export class AddoreditAdvancesalaryComponent {


  advanceSalaryForm!: FormGroup;
  Loader: boolean = false;
  EmpId: any;
  empID: any
  empbyidListlist: any = [];
  historyList: any = [];
  selectedRange: any;

  isLoan: any;
  departmentId: any;
  unitId: any;
  empid: any;

  Employeelist: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  showDropdown = false;
  showCloseIcon: boolean = false;
  isEditMode: boolean = false;
  salarybyidList: any = [];
  EMPID: any;
  salaryhistory: any[] = [];
  id: any;

  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router,
    private route: ActivatedRoute, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.advanceSalaryForm = this.formBuilder.group({
      EmpId: [''],
      Name: ['', Validators.required],
      Salary: [''],
      Department: [''],
      Unit: [''],
      Loan: [''],
      LoanAmount: [''],
      Emi: [''],
      balanceEmi: [''],
      balanceamount: [''],
      AdAmount: ['', Validators.required],
      Month: ['', Validators.required],
      PaidDate: ['', Validators.required]
    })

    this.filteredEmployees = [...this.Employeelist];
    this.getEmployeeNameFn();


    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const empid = params['empid'];

      this.isEditMode = !!(id);
      if (id) {
        this.getSalaryByIdFn(id, empid);
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



  /** get salary by id*/

  getSalaryByIdFn(id: string, EmployeeID: string) {
    this.id = id

    this.Loader = true;
    this.apiService.postData(environment.apiUrl + 'codspropay/api/getadvancedetails/', { advanceid: id, empid: EmployeeID }).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.salarybyidList = response['advanceemployeelist'];
        if (this.salarybyidList && this.salarybyidList.length > 0) {
          const adSalalary = this.salarybyidList[0];

          this.advanceSalaryForm.controls['Name'].setValue(adSalalary.employeename);
          this.advanceSalaryForm.controls['EmpId'].setValue(adSalalary.employeeId);
          this.advanceSalaryForm.controls['Salary'].setValue(adSalalary.salary);
          this.advanceSalaryForm.controls['Department'].setValue(adSalalary.department_name);
          this.advanceSalaryForm.controls['Unit'].setValue(adSalalary.unitname);
          this.advanceSalaryForm.controls['Loan'].setValue(adSalalary.loan);
          this.advanceSalaryForm.controls['LoanAmount'].setValue(adSalalary.amount);
          this.advanceSalaryForm.controls['Emi'].setValue(adSalalary.emiamount);
          this.advanceSalaryForm.controls['balanceEmi'].setValue(adSalalary.balance_emi);
          this.advanceSalaryForm.controls['balanceamount'].setValue(adSalalary.balanceamount);

          this.advanceSalaryForm.controls['AdAmount'].setValue(adSalalary.advanceamount);
          this.advanceSalaryForm.controls['Month'].setValue(adSalalary.date);
          this.advanceSalaryForm.controls['PaidDate'].setValue(adSalalary.advancedate);

          this.EMPID = adSalalary.employeeid;

          console.log('employee id:', this.EMPID);

          this.isLoan = adSalalary.loan

          this.salaryhistory = response['previoussalarydetails'];
          console.log('salary history', this.salaryhistory);

        } else {
          console.log('No data found.');
        }
      } else {
        this.handleErrorResponse(response); 
      }
    },
      (error) => {
        this.Loader = false; 
        this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }

  /** end get salary By id*/

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
    this.advanceSalaryForm.patchValue({ Name: employee.employeename });
    this.advanceSalaryForm.get('Name')?.markAsTouched();
    this.advanceSalaryForm.get('Name')?.updateValueAndValidity();

    this.getEmpByIdFn(employee.employeeId);
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


    this.advanceSalaryForm.patchValue({
      Name: '',
      EmpId: '',
      Salary: '',
      Department: '',
      Unit: '',
      Loan: '',
      LoanAmount: '',
      Emi: '',
      balanceEmi: '',
      balanceamount: ''

    });
    this.historyList = [];
    this.advanceSalaryForm.get('Name')?.markAsTouched();
    this.advanceSalaryForm.get('Name')?.updateValueAndValidity();
    this.showCloseIcon = false;
  }

  onInputChange(event: any) {
    const inputValue = event.target.value;
    this.showCloseIcon = inputValue.length > 0 || !!this.selectedEmployee;
  }


  /**get empname for dropdown */
  getEmployeeNameFn() {

    this.Loader = true;
    this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployeedetails/', { id: 'sample' })
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
          this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        })
  }
  /**END get empname for dropdown */




  /**get Employee By ID */
  getEmpByIdFn(empid: any) {
    this.empID = empid

    this.Loader = true;
    this.apiService.postData(environment.apiUrl + 'codspropay/api/get_employee/', { empid: this.empID }).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.empbyidListlist = response['employeelist'];
        if (this.empbyidListlist && this.empbyidListlist.length > 0) {
          const employee = this.empbyidListlist[0];

          this.advanceSalaryForm.controls['EmpId'].setValue(employee.employeeId);
          this.advanceSalaryForm.controls['Salary'].setValue(employee.basicsalary);
          this.advanceSalaryForm.controls['Department'].setValue(employee.department_name);
          // this.advanceSalaryForm.controls['Unit'].setValue(employee.unitname);

          this.advanceSalaryForm.controls['Loan'].setValue(employee.isLoan);
          this.advanceSalaryForm.controls['LoanAmount'].setValue(employee.loanamount);
          this.advanceSalaryForm.controls['Emi'].setValue(employee.emi);

          this.advanceSalaryForm.controls['balanceEmi'].setValue(employee.balanceemi);
          this.advanceSalaryForm.controls['balanceamount'].setValue(employee.balanceamount);

          this.isLoan = employee.isLoan
          this.departmentId = employee.departmentId
          this.unitId = employee.unitId

          this.empid = employee.empid

          this.historyList = response['previoushistory']

        } else {
          console.log('No data found.');
        }
      } else {
        this.handleErrorResponse(response); 
      }
    },
      (error) => {
        this.Loader = false; 
        this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }
  /**get Employee By ID */



  /* set salary date based on paid date */
  setDate() {
    const paidDate = this.advanceSalaryForm.get('PaidDate')?.value;

    if (paidDate) {
      const date = new Date(paidDate);
      let nextMonth = date.getMonth() + 2;
      let year = date.getFullYear();

      // Check if the next month goes beyond December
      if (nextMonth > 12) {
        nextMonth = 1; // January
        year += 1;     // Next year
      }

      // Format the next month as YYYY-MM
      const formattedNextMonth = new Date(year, nextMonth).toISOString().slice(0, 7);
      console.log(formattedNextMonth);

      this.advanceSalaryForm.get('Month')?.setValue(formattedNextMonth);

      // Get the current year and month
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7); // Format as YYYY-MM

      // if (formattedNextMonth < currentMonth) {
      //   this.showWarning('Salary already paid, not able to add advance salary!');
      // }
    }
  }
  /* END set salary date based on paid date */



  /**add Loan function */
  addAdSalary() {
    console.log('inside')
    if (this.advanceSalaryForm.invalid) {
      this.advanceSalaryForm.markAllAsTouched();
      return;
    }


    // Get the selected salary month and current month
    const paidDate = this.advanceSalaryForm.controls['PaidDate'].value;
    const selectedMonth = this.advanceSalaryForm.controls['Month'].value;
    const currentDate = new Date().toISOString().slice(0, 7); // Get current month in 'YYYY-MM' format

    // Ensure paidDate exists and validate that the selected salary month is not in the past
    // if (paidDate && selectedMonth < currentDate) {
    //   this.showWarning('Salary already paid, not able to add advance salary!');
    //   return; 
    // }

    const formdata = new FormData();

    if (this.isEditMode && this.id) {
      formdata.append('id', this.id);
    }

    // formdata.append('employeeid', this.empid);
    formdata.append('employeeid', this.advanceSalaryForm.controls['EmpId'].value);
    formdata.append('departmentId', this.departmentId);
    formdata.append('unitId', this.unitId);
    formdata.append('salary', this.advanceSalaryForm.controls['Salary'].value);
    formdata.append('advanceamount', this.advanceSalaryForm.controls['AdAmount'].value);
    formdata.append('date', this.advanceSalaryForm.controls['Month'].value);
    formdata.append('advancedate', this.advanceSalaryForm.controls['PaidDate'].value);

    this.Loader = true;

    const apiUrl = this.isEditMode
      ? environment.apiUrl + 'codspropay/api/editadvancesalary/'
      : environment.apiUrl + 'codspropay/api/addadvancesalary/';


    this.apiService.postData(apiUrl, formdata).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.toastrService.showSuccess(response.message);
        this.advanceSalaryForm.reset();
        this.router.navigateByUrl('superadmin/advancesalary');
      } else {
        this.handleErrorResponse(response); 
      }
    },
      (error) => {
        this.Loader = false; 
        this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); 
      })
  }
  /**END add Loan function */


  /**Reload Page */
  reloadCurrentPage() {
    window.location.reload();
  }
  /**END Reload Page */


  /**Error handling */
  private handleErrorResponse(response: any) {
    if (response['response'] === 'Error') {
      this.toastrService.showError(response.message);
      setTimeout(() => {
        this.Loader = false;
      }, 1500);
    } else if (response['response'] === 'Warning') {
      this.toastrService.showWarning(response.message);
      this.Loader = false;
    } else {
      this.toastrService.showError(response.message);
    }
  }

}
