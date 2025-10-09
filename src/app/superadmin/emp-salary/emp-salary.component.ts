
interface EmployeeDetails {
  employeeid: string;
  name: string;
  month_name: string;
  month: string;
  year: string;
  type: number;

  ot_earnings: number;
  total_ot: number;
  workingdays: number;
  pf: number;
  esi: number;

  total_earnings: number;
  salary: number;
  advancesalaryamount: number;

  emi: number;
  extraallowance: number;

  foodallowance: number;
  pfamount: number;

  basicsalary: number;
  da: number;
  hra: number;
  ta: number;
  basicda: number;

  unitid: string;
  // unit: string;
  departmentid: string;
  // department: string;

  hourlyrate: number;

  totaldeduction: number;
  paidsalary: number;
  holidayot_earnings: string;
  holidayot: string;
  oldbalance: string;
  basichours: number;
  workinghours: number;
  total_hours: number;
  othours: string;
  Ispaid: string;
  checked?: boolean;


  lop?: {
    days: number;
    amountPerDay: number;
    totalAmount: number;
  } | null;
  fines?: Array<{
    reason: string;
    date: string;
    amount: number;
  }>;

}


import { ApiService } from '../../core/services/api.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';


@Component({
  selector: 'app-emp-salary',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
        CommonModule, NgSelectModule, PaginatorModule,
        FormsModule],
  templateUrl: './emp-salary.component.html',
  styleUrl: './emp-salary.component.css'
})
export class EmpSalaryComponent {
 @ViewChild('checkboxTable') checkboxTable!: ElementRef;

  deleteCountryModal: boolean | undefined;
  EditModal: boolean | undefined;

  showInputRow: boolean = false;
  filterform!: FormGroup;
  editpaymentform!: FormGroup;

  first = 0;
  rows = 20;

  /*** boolean key for actions*/
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;
  blnHasSingleview: boolean = true;
  /*** boolean key for actions*/
  // paymentList: any = []

  Unit_ArrayList: any = [];
  unit_Id: any;
  Department_ArrayList: any = [];
  Dept_ID: any;


  selectedEmployeeDetails: any[] = [];

  currentPage = 1;
  itemsPerPage = 20; // Display 20 items per page initially
  itemsPerPageOptions = [20, 50, 100, 150, 250]; // Page size options for the paginator

  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

  driverchargelist: any = [];
  paymentId: any;
  salaryaddeddate: any;


  salaryList: any = [];
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);




  constructor(private router: Router, private formBuilder: FormBuilder, private apiService: ApiService, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) {
    this.initializeDeductionForm();

  }

  ngOnInit(): void {


    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");

    this.filterform = this.formBuilder.group({
      Department: ['',],
      Role: ['',],
      Month: ['',],
      paymentType: ['Full'],
      paidAmount: [''],
      salaryDate: ['',],
      // TotWorkingDays: ['',],

      searchID: [''],
      searchSalaryDate: ['',],
      // searchWorkingDays: ['',]
    });


    // Subscribe to payment type changes to toggle the paid amount field
    this.filterform.get('paymentType')?.valueChanges.subscribe(value => {
      const paidAmountControl = this.filterform.get('paidAmount');
      if (value === 'partial') {
        paidAmountControl?.setValidators([Validators.required]);
      } else {
        paidAmountControl?.clearValidators();
      }
      paidAmountControl?.updateValueAndValidity();
    });

    this.get_Department();

    this.paginatedPaymentList.forEach((item: EmployeeDetails) => {
      item.checked = item.Ispaid === 'Yes'; // Initialize checked state
    });

    this.filterform.get('Department')?.valueChanges.subscribe(() => {
      this.resetSearchSection();
    });
    this.filterform.get('Role')?.valueChanges.subscribe(() => {
      this.resetSearchSection();
    });
    this.filterform.get('Month')?.valueChanges.subscribe(() => {
      this.resetSearchSection();
    });
    // this.filterform.get('TotWorkingDays')?.valueChanges.subscribe(() => {
    //   this.resetSearchSection();
    // });
    this.filterform.get('salaryDate')?.valueChanges.subscribe(() => {
      this.resetSearchSection();
    });

    this.filterform.get('searchID')?.valueChanges.subscribe(() => {
      this.resetFilterSection();
    });
    this.filterform.get('searchWorkingDays')?.valueChanges.subscribe(() => {
      this.resetFilterSection();
    });
    this.filterform.get('searchSalaryDate')?.valueChanges.subscribe(() => {
      this.resetFilterSection();
    });

  }


  resetSearchSection() {
    this.filterform.patchValue({
      searchID: '',
      searchSalaryDate: '',
      // searchWorkingDays: ''
    }, { emitEvent: false }); // prevent recursion
  }

  resetFilterSection() {
    this.filterform.patchValue({
      Department: '',
      Role: '',
      Month: '',
      // TotWorkingDays: '',
      salaryDate: ''
    }, { emitEvent: false }); // prevent recursion
  }



  // Add these properties
  showDeductionDialog = false;
  currentEmployee: any;
  deductionForm!: FormGroup;
  tempCheckboxState: { employeeid: string; checked: boolean; element: HTMLInputElement } | null = null;



  initializeDeductionForm() {
    this.deductionForm = this.formBuilder.group({
      lopDays: [0, [Validators.min(0)]],
      amountPerDay: [0, [Validators.min(0)]],
      isSalaryWithheld: [false],
      withheldDays: [0, [Validators.min(0)]],
      fines: this.formBuilder.array([]),
      incentive: [0]
    });
  }


  createFineGroup(): FormGroup {
    return this.formBuilder.group({
      reason: [''],
      date: [''],
      amount: [0, [Validators.min(0)]] // Removed required validator
    });
  }

  get fines(): FormArray {
    return this.deductionForm.get('fines') as FormArray;
  }

  addFine() {
    this.fines.push(this.createFineGroup());
  }

  removeFine(index: number) {
    this.fines.removeAt(index);
  }

  onSalaryWithheldToggle() {
    const isChecked = this.deductionForm.get('isSalaryWithheld')?.value;
    if (!isChecked) {
      this.deductionForm.get('withheldDays')?.setValue(0);
    }
  }


    onCheckboxChange(employeeid: string, event: Event, item: EmployeeDetails): void {
    const checked = (event.target as HTMLInputElement).checked;

    console.log(`Checkbox change detected for ${employeeid}:`, checked);

    if (checked && item.Ispaid !== 'Yes') {
      console.log('Adding item to selectedEmployeeDetails');
      if (!this.selectedEmployeeDetails.some(detail => detail.employeeid === employeeid)) {
        this.selectedEmployeeDetails.push({
           employeeid: item.employeeid,
                name: item.name,
                month: item.month,
                month_name: item.month_name,
                year: item.year,
                // type: item.salarytype,

                ot_earnings: item.ot_earnings,
                total_otduration: item.total_ot,
                workingdays: item.workingdays,
                pf: item.pf || 0,
                esi: item.esi || 0,

                total_earnings: item.total_earnings,
                salary: item.salary,
                advancesalary: item.advancesalaryamount,
                emi: item.emi,
                pfamount: '',
                basicsalary: item.basicsalary,

                da: item.da,
                hra: item.hra,
                ta: item.ta,
                basicda: item.basicda,

                unit: item.unitid,          // ✅ pass unitid instead of unit name
                department: item.departmentid,  // ✅ pass departmentid instead of department name

                foodallowance: item.foodallowance || '0',
                extraallowance: item.extraallowance || '0',

                totaldeduction: item.totaldeduction,
                paidsalary: item.paidsalary,
                hourlyrate: item.hourlyrate,
                holidayot_earnings: item.holidayot_earnings,
                holidayot: item.holidayot,
                oldbalance: item.oldbalance,
                workinghours: item.workinghours,
                basichours: item.basichours,
                total_hours: item.total_hours,
                othours: item.othours,
        });
      } else {
        console.log(`Item ${employeeid} already exists in selectedEmployeeDetails`);
      }
    } else {
      console.log('Removing item from selectedEmployeeDetails');
      this.selectedEmployeeDetails = this.selectedEmployeeDetails.filter(detail => detail.employeeid !== employeeid);
    }

    // Update the selectAll checkbox state
    this.selectAll = this.paginatedPaymentList
      .filter((item: EmployeeDetails) => item.Ispaid !== 'Yes')
      .every((item: EmployeeDetails) => this.selectedEmployeeDetails.some(selectedItem => selectedItem.employeeid === item.employeeid));

    console.log('Updated selectedEmployeeDetails:', this.selectedEmployeeDetails);
  }





  // Add this helper method
  updateSelectAllState(): void {
    this.selectAll = this.paginatedPaymentList
      .filter((item: EmployeeDetails) => item.Ispaid !== 'Yes')
      .every((item: EmployeeDetails) => this.selectedEmployeeDetails.some(selectedItem => selectedItem.employeeid === item.employeeid));
  }

  saveDeduction() {
    const formValue = this.deductionForm.value;

    // Calculate LOP amount
    const lopAmount = (formValue.lopDays || 0) * (formValue.amountPerDay || 0);

    // Calculate total fine amount (only include fines with values)
    const totalFineAmount = (formValue.fines || [])
      .filter((fine: any) => fine.reason || fine.date || fine.amount > 0)
      .reduce((acc: number, fine: any) => acc + (fine.amount || 0), 0);

    // ✅ Incentive amount
    const incentiveAmount = formValue.incentive || 0;

    // Calculate total deductions (existing + fines + LOP)
    const totalDeductions = (this.currentEmployee.totaldeduction || 0) + totalFineAmount + lopAmount;

    // Calculate final salary (salary - fines - LOP + incentive)
    const finalSalary = (this.currentEmployee.salary || 0) - totalFineAmount - lopAmount + incentiveAmount;

    // Prepare the updated employee data
    const employeeWithDeductions = {
      ...this.currentEmployee,
      salary: finalSalary,  // Updated salary after deductions & incentive
      totaldeduction: totalDeductions,
      lop: formValue.lopDays > 0 ? {
        days: formValue.lopDays,
        amountPerDay: formValue.amountPerDay,
        totalAmount: lopAmount
      } : null,
      fines: formValue.fines?.filter((fine: any) => fine.reason || fine.date || fine.amount > 0) || [],

      // Withheld info
      iswithheld: formValue.isSalaryWithheld ? 'Yes' : 'No',
      withhelddays: formValue.isSalaryWithheld ? formValue.withheldDays || 0 : 0,

      // ✅ New field
      incentive: incentiveAmount,

      // For display/reference
      totalFineAmount,
      totalLopAmount: lopAmount
    };

    // Update or add the employee in selectedEmployeeDetails
    const existingIndex = this.selectedEmployeeDetails.findIndex(
      detail => detail.employeeid === this.currentEmployee.employeeid
    );

    if (existingIndex >= 0) {
      this.selectedEmployeeDetails[existingIndex] = employeeWithDeductions;
    } else {
      this.selectedEmployeeDetails.push(employeeWithDeductions);
    }

    if (this.tempCheckboxState) {
      this.tempCheckboxState.element.checked = true;
    }

    this.showDeductionDialog = false;
    this.tempCheckboxState = null;
    this.updateSelectAllState();
  }


  cancelDeduction() {
    this.showDeductionDialog = false;

    this.tempCheckboxState = null;

    this.updateSelectAllState();
  }





  // cancelDeduction() {
  //   this.showDeductionDialog = false;
  //   if (this.tempCheckboxState) {
  //     this.tempCheckboxState.element.checked = false;
  //     this.tempCheckboxState = null;
  //   }
  // }



  // fetch department

  selected_Deparment(event: any, action: any) {
    this.Dept_ID = event.target.value;
  }

  get_Department() {
  
    this.Loader = true;

     this.apiService.postData(environment.apiUrl + '/api/getactivedepartment/', { id: 'sample' }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Department_ArrayList = response['departmentlist']
        this.Loader = false;
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



  // filterby dept


  DeptFilterFn() {
    // if (!this.Dept_ID) {
    //   this.toastrService.showError('Please Select a Department.');
    //   return;
    // }

    const month = this.filterform.get('Month')?.value;
    const role = this.filterform.get('Role')?.value;
    const salaryDate = this.filterform.get('salaryDate')?.value;
    // const totWorkingDays = this.filterform.get('TotWorkingDays')?.value;

    // if (!month) {
    //   this.toastrService.showError('Please Select a Month.');
    //   return;
    // }

    // if (!salaryDate || !totWorkingDays) {
    //   this.toastrService.showError('Total Working Days and Salary Date are required.');
    //   return;
    // }

    const payload = {
      role: role,
      departmentid: this.Dept_ID,
      year_month: month,
      salarydate: salaryDate,
      total_working_days: 0
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/get_salarydetails/', payload).subscribe(
      (response: any) => {
        if (response.response === 'Success') {
          this.salaryList = response.details;
        } else {
          this.salaryList = [];
          this.toastrService.showError(response.message);
        }
        this.Loader = false;
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
    );
  }




  searchFn() {
    const employeeID = this.filterform.get('searchID')?.value;
    // const salaryDate = this.filterform.get('searchSalaryDate')?.value;
    // const workingDays = this.filterform.get('searchWorkingDays')?.value;

    // if (!employeeID) {
    //   this.toastrService.showError('Please enter an Employee ID.');
    //   return;
    // }

    // if (!salaryDate || !workingDays) {
    //   this.toastrService.showError('Salary Date and Total Working Days in search section are required.');
    //   return;
    // }

    const payload = {
      employeeid: employeeID,
      // salary_date: salaryDate,
      total_working_days: '0'
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployeesalarydetails/', payload).subscribe(
      (response: any) => {
        if (response.response === 'Success') {
          this.salaryList = response.details;
        } else {
          this.salaryList = [];
          this.toastrService.showError(response.message);
        }
        this.Loader = false;
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
    );
  }












  get paginatedPaymentList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.salaryList.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }

  selectAll: boolean = false;

  onSelectAllChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll = checked;

    // Select all eligible items across all pages
    this.selectedEmployeeDetails = checked
      ? this.salaryList
        .filter((item: EmployeeDetails) => item.Ispaid !== 'Yes')
        .map((item: EmployeeDetails) => ({
          employeeid: item.employeeid,
          name: item.name,
                    month: item.month,

          month_name: item.month_name,
          year: item.year,
          type: item.type,

          ot_earnings: item.ot_earnings,
          total_otduration: item.total_ot,
          workingdays: item.workingdays,
          pf: item.pf || 0,
          esi: item.esi || 0,

          total_earnings: item.total_earnings,
          salary: item.salary,
          advancesalary: item.advancesalaryamount,
          emi: item.emi,
          pfamount: '',
          basicsalary: item.basicsalary,

          da: item.da,
          hra: item.hra,
          ta: item.ta,
          basicda: item.basicda,

          unit: item.unitid,
          department: item.departmentid,

          foodallowance: item.foodallowance || '0',
          extraallowance: item.extraallowance || '0',

          totaldeduction: item.da,
          paidsalary: item.paidsalary,
          hourlyrate: item.hourlyrate,
          holidayot_earnings: item.holidayot_earnings,
          holidayot: item.holidayot,
          oldbalance: item.oldbalance,
          workinghours: item.workinghours,
          basichours: item.basichours,
          total_hours: item.total_hours,
          othours: item.othours,

        }))
      : [];

    // Update the checked state for each item in salaryList
    this.salaryList.forEach((item: EmployeeDetails) => {
      item.checked = checked && item.Ispaid !== 'Yes'; // Only check if not paid
    });

    console.log('Selected All:', this.selectedEmployeeDetails);
  }





  checkAllCheckboxes(): void {
    const checkboxes = this.checkboxTable.nativeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = true;
    });
  }

  uncheckAllCheckboxes(): void {
    const checkboxes = this.checkboxTable.nativeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = false;
    });
  }




  payout() {
 
    const status = this.filterform.get('paymentType')?.value || 'Full';
    const amount = this.filterform.get('paidAmount')?.value;
    const salaryDate = this.filterform.get('salaryDate')?.value || this.filterform.get('searchSalaryDate')?.value;
    // const totalWorkingDays = this.filterform.get('TotWorkingDays')?.value || this.filterform.get('searchWorkingDays')?.value;

    // Validation check
    // if (!salaryDate || !totalWorkingDays) {
    //   this.toastrService.showError('Salary Date and Total Working Days are required before proceeding.');
    //   return;
    // }
    // Map selected employees to include LOP and fine details
    const salaryArray = this.selectedEmployeeDetails.map(emp => ({
      ...emp,
      lop: emp.lop || null,
      fines: emp.fines || [],
      iswithheld: emp.iswithheld || 'No',
      withhelddays: emp.withhelddays || 0,
      incentive: emp.incentive || 0   
    }));

    const payload = {
      salaryarray: salaryArray,
      status: status,
      amount: amount,
      salarydate: salaryDate,
      totalworkingdays: '0'
    };

    console.log('Final Payload:', payload);

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/add_salary/', payload).subscribe(
      (response: any) => {
        if (response.response === 'Success') {
          this.Loader = false;
          this.toastrService.showSuccess(response.message);
          setTimeout(() => {
            this.reloadCurrentPage();
          }, 1000);
        } else if (response.response === 'Warning') {
          this.Loader = false;
          this.toastrService.showWarning(response.message);
        }
        else {
          this.handleErrorResponse(response);
        }
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
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
