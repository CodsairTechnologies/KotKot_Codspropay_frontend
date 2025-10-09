import { HttpClient, HttpHeaders } from '@angular/common/http';
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


  addadSalaryForm!: FormGroup;

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
  vehiclenamelist: any = [];
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
  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router, private route: ActivatedRoute, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

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


    this.addadSalaryForm = this.formBuilder.group({
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

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/getadvancedetails/', { advanceid: id, empid: EmployeeID }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.salarybyidList = response['advanceemployeelist'];
        if (this.salarybyidList && this.salarybyidList.length > 0) {
          const adSalalary = this.salarybyidList[0];

          this.addadSalaryForm.controls['Name'].setValue(adSalalary.employeename);
          this.addadSalaryForm.controls['EmpId'].setValue(adSalalary.employeeId);
          this.addadSalaryForm.controls['Salary'].setValue(adSalalary.salary);
          this.addadSalaryForm.controls['Department'].setValue(adSalalary.department_name);
          this.addadSalaryForm.controls['Unit'].setValue(adSalalary.unitname);
          this.addadSalaryForm.controls['Loan'].setValue(adSalalary.loan);
          this.addadSalaryForm.controls['LoanAmount'].setValue(adSalalary.amount);
          this.addadSalaryForm.controls['Emi'].setValue(adSalalary.emiamount);
          this.addadSalaryForm.controls['balanceEmi'].setValue(adSalalary.balance_emi);
          this.addadSalaryForm.controls['balanceamount'].setValue(adSalalary.balanceamount);



          this.addadSalaryForm.controls['AdAmount'].setValue(adSalalary.advanceamount);
          this.addadSalaryForm.controls['Month'].setValue(adSalalary.date);
          this.addadSalaryForm.controls['PaidDate'].setValue(adSalalary.advancedate);

          this.EMPID = adSalalary.employeeid;

          console.log('employee id:', this.EMPID);

          this.isLoan = adSalalary.loan

          this.salaryhistory = response['previoussalarydetails'];
          console.log('salary history', this.salaryhistory);

        } else {
          console.log('No data found.');
        }
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }

  /** get salary By id*/
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
    this.addadSalaryForm.patchValue({ Name: employee.employeename });
    this.addadSalaryForm.get('Name')?.markAsTouched();
    this.addadSalaryForm.get('Name')?.updateValueAndValidity();

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


    this.addadSalaryForm.patchValue({
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
    this.addadSalaryForm.get('Name')?.markAsTouched();
    this.addadSalaryForm.get('Name')?.updateValueAndValidity();
    this.showCloseIcon = false;
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
    this.http.post(environment.apiUrl + 'codspropay/api/getemployeedetails/', { id: 'sample' }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.Employeelist = response.employeelist;
          this.filteredEmployees = this.Employeelist;
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
        (error) => {
          this.Loader = false; // Hide loader on error
          this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
        })
  }
  /**END get empname for dropdown */




  /**get Employee By ID */
  getEmpByIdFn(empid: any) {
    this.empID = empid
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/get_employee/', { empid: this.empID }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.empbyidListlist = response['employeelist'];
        if (this.empbyidListlist && this.empbyidListlist.length > 0) {
          const employee = this.empbyidListlist[0];

          this.addadSalaryForm.controls['EmpId'].setValue(employee.employeeId);
          this.addadSalaryForm.controls['Salary'].setValue(employee.basicsalary);
          this.addadSalaryForm.controls['Department'].setValue(employee.department_name);
          // this.addadSalaryForm.controls['Unit'].setValue(employee.unitname);

          this.addadSalaryForm.controls['Loan'].setValue(employee.isLoan);
          this.addadSalaryForm.controls['LoanAmount'].setValue(employee.loanamount);
          this.addadSalaryForm.controls['Emi'].setValue(employee.emi);

          this.addadSalaryForm.controls['balanceEmi'].setValue(employee.balanceemi);
          this.addadSalaryForm.controls['balanceamount'].setValue(employee.balanceamount);

          this.isLoan = employee.isLoan
          this.departmentId = employee.departmentId
          this.unitId = employee.unitId

          this.empid = employee.empid

          this.historyList = response['previoushistory']

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
  /**get Employee By ID */



  /* set salary date based on paid date */
  setDate() {
    const paidDate = this.addadSalaryForm.get('PaidDate')?.value;

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

      this.addadSalaryForm.get('Month')?.setValue(formattedNextMonth);

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
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
    if (this.addadSalaryForm.invalid) {
      this.addadSalaryForm.markAllAsTouched();
      return;
    }


    // Get the selected salary month and current month
    const paidDate = this.addadSalaryForm.controls['PaidDate'].value;
    const selectedMonth = this.addadSalaryForm.controls['Month'].value;
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
    formdata.append('employeeid', this.addadSalaryForm.controls['EmpId'].value);
    formdata.append('departmentId', this.departmentId);
    formdata.append('unitId', this.unitId);
    formdata.append('salary', this.addadSalaryForm.controls['Salary'].value);
    formdata.append('advanceamount', this.addadSalaryForm.controls['AdAmount'].value);
    formdata.append('date', this.addadSalaryForm.controls['Month'].value);
    formdata.append('advancedate', this.addadSalaryForm.controls['PaidDate'].value);

    this.Loader = true;

    const apiUrl = this.isEditMode
      ? environment.apiUrl + 'codspropay/api/editadvancesalary/'
      : environment.apiUrl + 'codspropay/api/addadvancesalary/';


    this.http.post(apiUrl, formdata, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.toastrService.showSuccess(response.message);
        this.addadSalaryForm.reset();
        this.router.navigateByUrl('superadmin/advancesalary');
      } else {
        this.handleErrorResponse(response); // Handle non-success responses
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
        this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
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
