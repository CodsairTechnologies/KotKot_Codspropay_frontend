import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { ApiService } from '../../core/services/api.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import Swal from 'sweetalert2';
import { CommonModule, DatePipe } from '@angular/common';

import { Workbook } from 'exceljs';
import { ActivatedRoute, Params } from '@angular/router';

import { Document, Packer, Paragraph, TextRun} from 'docx';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';
import * as fs from 'file-saver';


import * as bootstrap from 'bootstrap';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { PaginatorModule } from 'primeng/paginator';
import { ErrorHandlingService } from '../../core/services/error-handling.service';



const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';


interface ExpiryData {
  model: string;
  License: string;
  Passport: string;
  Visa: string;
  expiry_count: number;
}
@Component({
  selector: 'app-employees-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent, PaginatorModule,
      CommonModule,
      FormsModule],
  templateUrl: './employees-profile.component.html',
  styleUrl: './employees-profile.component.css',
    providers: [DatePipe],
  animations: [
    trigger('toggleBox', [
      state('void', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden',
        padding: '0 50px'
      })),
      state('*', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden',
        padding: '30px 50px 50px 60px'
      })),
      transition('void <=> *', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class EmployeesProfileComponent {
  @ViewChild('profilecontent') profilecontent!: ElementRef;
  @ViewChild('experiencecertificate') experiencecertificate!: ElementRef;

  @ViewChild('payslip') payslip!: ElementRef;
  @ViewChild('timesheet') timesheet!: ElementRef;



  EmployeeForm!: FormGroup;
  SalaryForm!: FormGroup;
  PFForm!: FormGroup;
  ESIForm!: FormGroup;
  editsalaryform!: FormGroup;
  FilterForm!: FormGroup;
  EditPFForm!: FormGroup;
  editESIForm!: FormGroup;
  payslipfilter!: FormGroup;
  DocumentForm!: FormGroup;
  timesheetForm!: FormGroup;

  token: any
  issalaryBoxVisible = false;
  isPFBoxVisible = false;
  isESIBoxVisible = false;
  isloanBoxVisible = false;
  isDocumentBoxVisible = false;

  employeeId: any;
  Loader: boolean = false;
  id: any;
  EmpDetailsList: any = [];
  SalaryDetailsList: any = [];
  salList: any[] = [];
  loanhistory: any = [];
  PfDetails: any = [];
  paySlipList: any = [];
  timesheetList: any = [];
  selectedEmployeeDetails: { employeeid: string, id: string }[] = [];
  empdetails: any = [];

  profileimgurl: any;
  adharurl: any;
  panurl: any;
  passporturl: any;
  drivingurl: any;
  visaurl: any;
  idurl: any;
  warningMessage: string | null = null;

  first = 0;
  rows = 10;
  currentPage = 1;
  itemsPerPage = 5; // Default items per page
  itemsPerPageOptions = [5, 10, 15, 20]; // Page size options

  apiurl: any = environment.apiUrl;

  currentDate: Date = new Date();
  joiningDateFormatted: string = '';

  singleviewid: any;
  pronoun: string = '';
  possessivePronoun: string = '';
  objectivePronoun: string = '';

  rejoinDate: string = '';

  expiryList: any = [];
  resignationForm !: FormGroup

  constructor(private rout: ActivatedRoute, private formBuilder: FormBuilder, private apiService: ApiService, private router: Router, private datePipe: DatePipe, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {


    this.token = sessionStorage.getItem("token");
    console.log(this.token);

    // Form Initialization
    this.resignationForm = this.formBuilder.group({
      resignDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });



    // this.employeeId = sessionStorage.getItem("employeeId");
    // this.id = sessionStorage.getItem("profileid");
    // this.singleviewid = sessionStorage.getItem("singleviewid");

    // this.rout.params.subscribe((params: Params) => {
    //   this.employeeId = params['value']; // Use 'value' as defined in the route
    //   this.getEmpDetailsById(); // Call your method to fetch employee details
    // });

    this.rout.params.subscribe((params: Params) => {
      this.employeeId = params['value'];
      this.id = sessionStorage.getItem('profileid');

      console.log('Employee ID:', this.employeeId);
      console.log('Profile ID retrieved from session storage:', this.id);

      this.getEmpDetailsById();
    });


    this.EmployeeForm = this.formBuilder.group({

      Name: [''],
      ContactNo: [''],
      EmpID: [''],
      Email: [''],
      Unit: [''],
      Department: [''],
      Designation: [''],
      PF: [''],
      UAN: [''],
      PFAmount: [''],
      IP: [''],
      CasualLeave: [''],
      OT: [''],
      Shift: [''],


    });

    this.SalaryForm = this.formBuilder.group({

      Salary: [''],
      DA: [''],
      HRA: [''],
      TA: [''],
      FoodAllowance: [''],
      ExtraAllowance: [''],
      monthlyworkingdays: ['']

    });

    this.PFForm = this.formBuilder.group({
      PFNumber: [''],
      UANNumber: [''],
      PFAmount: [''],
      PFPercentage: [''],

    });

    this.EditPFForm = this.formBuilder.group({
      PFAmount: ['', Validators.required],
    });


    this.ESIForm = this.formBuilder.group({
      ESI: [''],

    });

    this.DocumentForm = this.formBuilder.group({
      Adhar: [''],
      AadharNumber: [''],
      Pan: [''],
      PanNumber: [''],
      Passport: [''],
      PassportNumber: [''],
      PassportExpiry: [''],
      Visa: [''],
      VisaNumber: [''],
      VisaExpiry: [''],
      DrivingLicence: [''],
      DrivingLicenceNumber: [''],
      LicenceExpiry: [''],
      ID: [''],
      IDNumber: [''],
      IDExpiry: [''],
    });


    this.editsalaryform = this.formBuilder.group({
      BasicSalary: ['', Validators.required],
      DA: ['', Validators.required],
      HRA: ['', Validators.required],
      TA: ['', Validators.required],
      FoodAllowance: ['', Validators.required],
      ExtraAllowance: ['', Validators.required],
    });

    this.FilterForm = this.formBuilder.group({
      fromDate: [''],
      toDate: ['']

    });

    const currentYear = new Date().getFullYear();


    this.payslipfilter = this.formBuilder.group({
      month: ['', Validators.required],
      year: [currentYear, [Validators.required, Validators.min(1900), Validators.max(2099)]]
    });

    this.timesheetForm = this.formBuilder.group({
      month: ['', Validators.required],
    })

    // this.getEmpDetailsById();

    this.getDocumentexpiryFn();

  }


  arrList: any = [];

  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Loan No", strAlign: "center", strKey: "loanNo" },
    { strHeader: "Amount", strAlign: "center", strKey: "amount" },
    { strHeader: "EMI", strAlign: "center", strKey: "emiamount" },
    { strHeader: "Balance Amount", strAlign: "center", strKey: "balanceamount" },
    { strHeader: "Balance EMI", strAlign: "center", strKey: "remainingemi" },
    { strHeader: "Status", strAlign: "center", strKey: "status" },

  ]






  getDocumentexpiryFn() {


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getemployeeexpiryfields/', { employeeid: this.employeeId }).subscribe(
      (response: any) => {
        this.Loader = false; // Ensure loader is hidden in both success and error cases

        if (response['response'] === 'Success') {
          this.expiryList = response.expiry_data as ExpiryData[]
          this.checkAndDisplayWarning(this.expiryList); // Call the function to check and display warning
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

  checkAndDisplayWarning(expiryList: ExpiryData[]) {
    let reminders = '';

    expiryList.forEach((expiry: ExpiryData) => {
      // Checking for expired documents and including the expiration date
      const licenseReminder = this.getReminderMessage(expiry.License, 'Driving License');
      const passportReminder = this.getReminderMessage(expiry.Passport, 'Passport');
      const visaReminder = this.getReminderMessage(expiry.Visa, 'Visa');

      if (licenseReminder) {
        reminders += `• ${licenseReminder}<br>`;
      }
      if (passportReminder) {
        reminders += `• ${passportReminder}<br>`;
      }
      if (visaReminder) {
        reminders += `• ${visaReminder}<br>`;
      }
    });

    // If there are any reminders, display the warning message
    if (reminders) {
      reminders += '<br>Please renew soon.';

      // Display the warning message
      this.showWarningMessage(reminders);
    }
  }




  showWarningMessage(reminders: string) {
    return Swal.fire({
      icon: 'warning',
      title: 'Upcoming Expirations',
      html: `<div style="max-height: 150px; overflow-y: auto;">${reminders}</div>`,
      showConfirmButton: true,
      width: '600px',
      timer: 5000,  // Auto close after 5 seconds
      timerProgressBar: true,  // Show a timer progress bar
      customClass: {
        popup: 'popup-scroll'
      },
      willOpen: () => {
        const content = Swal.getHtmlContainer();
        content?.addEventListener('mouseenter', () => {
          Swal.stopTimer();
        });
        content?.addEventListener('mouseleave', () => {
          Swal.resumeTimer();
        });
      }
    });
  }



  // Helper function to generate reminder message
  getReminderMessage(value: string, type: string): string | null {
    if (value === 'Expired') {
      return `${type} has expired.`;
    }

    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(value); // Check if the value is in 'YYYY-MM-DD' format
    if (isDate) {
      return `${type} will expire on ${value}.`;
    }

    const isDays = /^\d+\s+days?$/.test(value); // Check if the value is in days format
    if (isDays) {
      return `${type} will expire in ${value}.`;
    }

    return null;
  }



  // Function to show SweetAlert2 reminder and dismiss automatically
  showReminder(message: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Reminder',
      text: message,
      timer: 5000,  // Auto close after 5 seconds
      timerProgressBar: true,
      showConfirmButton: false
    });
  }


  get paginatedPaymentList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.salList.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
  }



  toggleBox(box: string) {
    if (box === 'salary') {
      this.issalaryBoxVisible = !this.issalaryBoxVisible;
    } else if (box === 'pf') {
      this.isPFBoxVisible = !this.isPFBoxVisible;
    } else if (box === 'esi') {
      this.isESIBoxVisible = !this.isESIBoxVisible;
    } else if (box === 'loan') {
      this.isloanBoxVisible = !this.isloanBoxVisible;
    } else if (box === 'document') {
      this.isDocumentBoxVisible = !this.isDocumentBoxVisible;
    }

  }


  route() {
    this.router.navigateByUrl('superadmin/given-salary')
  }


  openImageModal(imageUrl: string) {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    } else {
      console.log('No image URL provided');
    }
  }


  confirmRejoin() {
    if (!this.rejoinDate) {
      this.toastrService.showWarning('Please select a rejoin date.');
      return;
    }

    this.Loader = true;
    const payload = {
      employeeid: this.employeeId,
      rejoiningdate: this.rejoinDate
    };

     this.apiService.postData(environment.apiUrl + '/api/addrejoin/', payload)
      .subscribe((response: any) => {
        this.Loader = false;

        if (response.response === 'Success') {
          this.toastrService.showSuccess(response.message);
          setTimeout(() => {
            this.router.navigateByUrl('superadmin/rejoined_employees').then(() => {
              window.location.reload(); // reload after navigation
            });
          }, 1000);
        }


        else if (response.response === 'Error') {
          this.toastrService.showError(response.message);
        } else {
          this.toastrService.showWarning(response.message);
        }
      }, error => {
        this.Loader = false;
        this.toastrService.showError('An error occurred!');
      });
  }


  /* rejoin end */

  /**get employee details by id */

  getEmpDetailsById() {

    console.log(this.token);


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/employeesingleview/', { employeeid: this.employeeId }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.EmpDetailsList = response['employeesingleviewlist'];

        if (this.EmpDetailsList.length > 0) {
          const empdetails = this.EmpDetailsList[0];

          this.empdetails = empdetails;
          // Set pronouns based on gender
          if (empdetails.gender === 'Female') {
            this.pronoun = 'She';
            this.possessivePronoun = 'her';
            this.objectivePronoun = 'her';
          } else {
            this.pronoun = 'He';
            this.possessivePronoun = 'his';
            this.objectivePronoun = 'him';
          }


          if (empdetails.resigneddate) {
            console.log("Employee resigned on:", empdetails.resigneddate);
          }

          this.joiningDateFormatted = this.formatDate(empdetails.joiningdate);

          this.profileimgurl = empdetails.profileimgurl;

          this.adharurl = this.empdetails.adharimgurl;
          this.panurl = this.empdetails.panimgurl;
          this.passporturl = this.empdetails.passportimgurl;
          this.drivingurl = this.empdetails.drivinglicenseimgurl;


          this.EmployeeForm.controls['Name'].setValue(empdetails.name);
          this.EmployeeForm.controls['ContactNo'].setValue(empdetails.contactNo);
          this.EmployeeForm.controls['EmpID'].setValue(empdetails.employeeId);
          this.EmployeeForm.controls['Email'].setValue(empdetails.email);
          this.EmployeeForm.controls['Unit'].setValue(empdetails.unitname);
          this.EmployeeForm.controls['Department'].setValue(empdetails.departmentname);
          this.EmployeeForm.controls['Designation'].setValue(empdetails.designation);
          this.EmployeeForm.controls['PF'].setValue(empdetails.pfno);
          this.EmployeeForm.controls['UAN'].setValue(empdetails.uanno);
          this.EmployeeForm.controls['IP'].setValue(empdetails.ipno);
          this.EmployeeForm.controls['OT'].setValue(empdetails.isOT);
          this.EmployeeForm.controls['CasualLeave'].setValue(empdetails.leavedays);
          this.EmployeeForm.controls['Shift'].setValue(this.empdetails.shift);



          this.PFForm.controls['PFNumber'].setValue(empdetails.pfno);
          this.PFForm.controls['UANNumber'].setValue(empdetails.uanno);
          this.PFForm.controls['PFAmount'].setValue(empdetails.pfamount);
          this.PFForm.controls['PFPercentage'].setValue(empdetails.pf);

          this.ESIForm.controls['ESI'].setValue(empdetails.esi);


          this.adharurl = this.empdetails.adharimgurl;
          this.panurl = this.empdetails.panimgurl;
          this.passporturl = this.empdetails.passportimgurl;
          this.drivingurl = this.empdetails.drivinglicenseimgurl;

          this.visaurl = this.empdetails.visaimg;
          this.idurl = this.empdetails.otherIdimg;

          this.DocumentForm.controls['AadharNumber'].setValue(this.empdetails.adharNo);
          this.DocumentForm.controls['PanNumber'].setValue(this.empdetails.panNo);
          this.DocumentForm.controls['PassportNumber'].setValue(this.empdetails.passportNo);
          this.DocumentForm.controls['DrivingLicenceNumber'].setValue(this.empdetails.drivinglicenseNo);
          this.DocumentForm.controls['VisaNumber'].setValue(this.empdetails.visaNo);
          this.DocumentForm.controls['IDNumber'].setValue(this.empdetails.otherIdNo);

          this.DocumentForm.controls['LicenceExpiry'].setValue(this.empdetails.drivinglicenseExpiry);
          this.DocumentForm.controls['PassportExpiry'].setValue(this.empdetails.passportExpiry);
          this.DocumentForm.controls['VisaExpiry'].setValue(this.empdetails.visaExpiry);
          this.DocumentForm.controls['IDExpiry'].setValue(this.empdetails.otherIdExpiry);


          this.SalaryDetailsList = response['salarydetails'];


          const salarydetails = this.SalaryDetailsList[0];

          this.SalaryForm.controls['Salary'].setValue(salarydetails.basicsalary);
          this.SalaryForm.controls['DA'].setValue(salarydetails.da);
          this.SalaryForm.controls['HRA'].setValue(salarydetails.hra);
          this.SalaryForm.controls['TA'].setValue(salarydetails.ta);

          this.SalaryForm.controls['FoodAllowance'].setValue(salarydetails.foodallowance);
          this.SalaryForm.controls['ExtraAllowance'].setValue(salarydetails.extraallowance);
          this.SalaryForm.controls['monthlyworkingdays'].setValue(salarydetails.monthlyworkingdays);

          response.loandetails.map((obj: { [x: string]: any; }, index: number) => {
            obj['slNo'] = index + 1
          })

          this.arrList = response['loandetails'];

        }
      } else {
        this.Loader = false;
        this.toastrService.showError(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }

  /**get employee details by id */

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return ''; // Return an empty string if the date is null, undefined, or an empty string
    }

    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      return ''; // Return an empty string if the date is invalid
    }

    return this.datePipe.transform(dateObj, 'dd MMMM yyyy') || '';
  }


  /**get salary history table */

  getSalaryHistoryTableFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getsalaryhistory/', { employeeid: this.employeeId })
      .subscribe((response: any) => {
        if (response.response === 'Success') {
          this.Loader = false;
          this.salList = response.salaryhistorylist;
          console.log(this.salList);
        } else if (response.response === 'Error') {
          this.Loader = false;
          this.toastrService.showError(response.message);
        } else {
          this.Loader = false;
          this.toastrService.showError(response.message);
        }
      },
        (error) => {
          this.Loader = false;
          console.error("Error occurred:", error);
          this.toastrService.showError("Something went wrong. Please try again later");
        });
  }
  /**get salary history table */


  /** salary history filter by date */

  SalaryFilterByDateFn() {

    const fromdate = this.FilterForm.get('fromDate')?.value;
    const todate = this.FilterForm.get('toDate')?.value;


    const payload = {
      salaryaddeddate: fromdate,
      salarychangedate: todate
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getsalarybydate/', payload).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.salList = response.salarydetails;
        console.log(this.salList);
      } else if (response.response === 'warning') {
        this.Loader = false;
        this.toastrService.showWarning(response.message);
        this.salList = [];
      } else {
        this.Loader = false;
        this.toastrService.showError(response.message);
      }
    }, (error) => {
      this.Loader = false;
      console.error("Error occurred:", error);
      this.toastrService.showError("Something went wrong. Please try again later");
    });
  }
  /** salary history filter by date */


  /**get loan history table */

  getLoanHistoryTableFn() {
  
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getloanhistory/', { employeeid: this.employeeId })
      .subscribe((response: any) => {
        if (response.response === 'Success') {
          this.Loader = false;
          this.loanhistory = response.loanhistorylist;
          console.log(this.salList);
        } else if (response.response === 'Error') {
          this.Loader = false;
          this.toastrService.showError(response.message);
        } else {
          this.Loader = false;
          this.toastrService.showWarning(response.message);
        }
      }, error => {
        this.Loader = false;
        this.toastrService.showError('An error occurred!');
      });
  }
  /**get loan history table */



  setSalaryValues() {


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/employeesingleview/', { employeeid: this.employeeId }).subscribe((response: any) => {
      this.Loader = false;
      if (response['response'] == 'Success') {

        this.Loader = false;
        this.SalaryDetailsList = response['salarydetails'];


        const salarydetails = this.SalaryDetailsList[0];

        this.editsalaryform.controls['BasicSalary'].setValue(salarydetails.basicsalary);
        this.editsalaryform.controls['DA'].setValue(salarydetails.da);
        this.editsalaryform.controls['HRA'].setValue(salarydetails.hra);
        this.editsalaryform.controls['TA'].setValue(salarydetails.ta);

        this.editsalaryform.controls['FoodAllowance'].setValue(salarydetails.foodallowance);
        this.editsalaryform.controls['ExtraAllowance'].setValue(salarydetails.extraallowance);

        this.PfDetails = response['employeesingleviewlist'];
        const pf = this.PfDetails[0];


        this.EditPFForm.controls['PFAmount'].setValue(pf.pfamount);

      } else if (response['response'] == 'Error') {
        this.Loader = false;
        this.toastrService.showError(response.message);
      } else {
        this.Loader = false;
        this.toastrService.showWarning(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }

  // edit pf amount

  editPfFn() {

    if (this.EditPFForm.invalid) {
      return;
    }

    var formdata = new FormData();


    formdata.append('pfamount', this.EditPFForm.controls['PFAmount'].value);
    formdata.append('employeeid', this.employeeId);

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/editpf/', formdata).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.toastrService.showSuccess(response.message);
        this.reloadCurrentPage();
      } else if (response['response'] == 'Error') {
        this.Loader = false;
        this.toastrService.showError(response.message);
      } else {
        this.Loader = false;
        this.toastrService.showWarning(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }




  /**edit payment */
  editPaymentFn() {
 

    if (this.editsalaryform.invalid) {
      return;
    }

    var formdata = new FormData();

    let salaryDetails = [
      {
        employeeid: this.employeeId,
        id: this.id
      }
    ];

    formdata.append('salary', this.editsalaryform.controls['BasicSalary'].value);
    formdata.append('Da', this.editsalaryform.controls['DA'].value);
    formdata.append('Hra', this.editsalaryform.controls['HRA'].value);
    formdata.append('Ta', this.editsalaryform.controls['TA'].value);

    formdata.append('foodallowance', this.editsalaryform.controls['FoodAllowance'].value);
    formdata.append('extraaalowance', this.editsalaryform.controls['ExtraAllowance'].value);
    formdata.append('salarydetails', JSON.stringify(salaryDetails));

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/edit_salary/', formdata).subscribe((response: any) => {
      this.Loader = false;
      if (response['response'] == 'Success') {
        this.Loader = false
        this.toastrService.showSuccess(response.message);
        this.reloadCurrentPage();
      } else if (response['response'] == 'Error') {
        this.Loader = false;
        this.toastrService.showError(response.message);
      } else {
        this.Loader = false;
        this.toastrService.showWarning(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }

  /**edit payment */


  /**edit PF */
  Editpf() {
    if (this.EditPFForm.invalid) {
      return;
    }

    var formdata = new FormData();
    formdata.append('salary', this.EditPFForm.controls['EmployeeContribution'].value);
    formdata.append('Da', this.EditPFForm.controls['EmployerContribution'].value);

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '', formdata).subscribe((response: any) => {
      this.Loader = false;
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.toastrService.showSuccess(response.message);
        this.reloadCurrentPage();
      } else if (response['response'] == 'Error') {
        this.Loader = false;
        this.toastrService.showError(response.message);
      } else {
        this.Loader = false;
        this.toastrService.showWarning(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }

  /**edit PF */


  /**edit ESI */
  EditESI() {

    if (this.editESIForm.invalid) {
      return;
    }

    var formdata = new FormData();



    formdata.append('salary', this.editESIForm.controls['EmployeeContribution'].value);


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '', formdata).subscribe((response: any) => {
      this.Loader = false;
      if (response['response'] == 'Success') {
        this.Loader = false;
        this.toastrService.showSuccess(response.message);
        this.reloadCurrentPage();
      } else if (response['response'] == 'Error') {
        this.Loader = false;
        this.toastrService.showError(response.message);
      } else {
        this.Loader = false;
        this.toastrService.showWarning(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }

  /**edit ESI */



  /**print profile  */

  downloadPDF() {
    let DATA = this.profilecontent.nativeElement;
    let options = {
      background: '#ffffff',
      scale: 2,
      useCORS: true,
    };

    html2canvas(DATA, options).then((canvas) => {
      let pdf = new jsPDF('p', 'mm', 'a4');

      // Define margins (in mm) for border and page
      const borderTopMargin = 5; // 5mm top margin from page edge
      const borderRightMargin = 20; // 20mm right margin from page edge
      const borderBottomMargin = 20; // 20mm bottom margin from page edge
      const borderLeftMargin = 20; // 20mm left margin from page edge

      // Define page dimensions
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm

      // Calculate content dimensions with the specified margins
      const contentWidth = pageWidth - borderLeftMargin - borderRightMargin;
      const contentHeight = pageHeight - borderTopMargin - borderBottomMargin;

      let imgWidth = contentWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = borderTopMargin;

      // Function to draw border on each page
      const drawBorder = () => {
        pdf.setLineWidth(0.2); // Reduced border thickness
        pdf.rect(borderLeftMargin, borderTopMargin, contentWidth, contentHeight); // Draw border
      };

      // Add the first page of the image
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', borderLeftMargin, position, imgWidth, imgHeight);
      drawBorder(); // Draw border on the first page
      heightLeft -= contentHeight;

      // Add additional pages if the content exceeds one page
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight + borderTopMargin;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', borderLeftMargin, position, imgWidth, imgHeight);
        drawBorder(); // Draw border on each subsequent page
        heightLeft -= contentHeight;
      }

      // Get the employee name
      let employeeName = this.EmpDetailsList[0]?.name || 'employee';

      // Replace spaces with underscores to form a valid filename
      let fileName = `${employeeName.replace(/\s+/g, '_')}_profile.pdf`;

      // Save the PDF with the generated filename
      pdf.save(fileName);
    });
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



  downloadCertificate() {
    if (!this.joiningDateFormatted || this.joiningDateFormatted.trim() === '') {
      this.toastrService.showError('Joining date is null or empty');
      return;
    }

    const emp = this.EmpDetailsList[0];

    // Check if resigned or ongoing
    const employmentPeriod = emp.resigneddate
      ? `was working with us as ${emp.designation} from ${this.formatDate(emp.joiningdate)} to ${this.formatDate(emp.resigneddate)}.`
      : `is working with us as ${emp.designation} from ${this.formatDate(emp.joiningdate)} onwards.`;

    const professionalismSentence = emp.resigneddate
      ? `${this.pronoun} was professionally sound, hard-working, and a devoted worker. ${this.pronoun} was efficient and punctual in ${this.possessivePronoun} duty time and very obedient.`
      : `${this.pronoun} is professionally sound, hard-working, and a devoted worker. ${this.pronoun} is efficient and punctual in ${this.possessivePronoun} duty time and very obedient.`;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Add heading with underline
            new Paragraph({
              children: [
                new TextRun({
                  text: "WHOMSOEVER IT MAY CONCERN",
                  bold: true,
                  underline: {}, // Underline text
                  size: 22, // Changed to 22
                  font: "Calibri",
                }),
              ],
              alignment: "center",
              spacing: { after: 600, before: 1500 },
            }),

            // Add certificate content
            new Paragraph({
              children: [
                new TextRun({
                  text: `This is to certify that `,
                  font: "Calibri",
                  size: 22, // Changed to 22
                }),
                new TextRun({
                  text: emp.name,
                  bold: true,
                  font: "Calibri",
                  size: 22, // Changed to 22
                }),
                new TextRun({
                  text: `, ${emp.address}, `,
                  bold: true,
                  font: "Calibri",
                  size: 22, // Changed to 22
                }),
                new TextRun({
                  text: emp.resigneddate
                    ? `was working with us as `
                    : `is working with us as `,
                  font: "Calibri",
                  size: 22, // Changed to 22
                }),
                new TextRun({
                  text: emp.designation,
                  bold: true,
                  font: "Calibri",
                  size: 22, // Changed to 22
                }),
                new TextRun({
                  text: emp.resigneddate
                    ? ` from ${this.formatDate(emp.joiningdate)} to ${this.formatDate(emp.resigneddate)}. `
                    : ` from ${this.formatDate(emp.joiningdate)} onwards. `,
                  font: "Calibri",
                  bold: true,
                  size: 22, // Changed to 22
                }),
                new TextRun({
                  text: professionalismSentence + ` We wish ${this.objectivePronoun} all success in future and endeavours.`,
                  font: "Calibri",
                  size: 22, // Changed to 22
                }),
              ],
              spacing: { after: 300 },
            }),

            // Add space before the signature section
            new Paragraph({
              children: [
                new TextRun({
                  text: "For DUROPACK INDUSTRIES PVT. LTD.",
                  bold: true,
                  size: 22, // Changed to 22
                  font: "Calibri",
                }),
              ],
              alignment: "left",
              spacing: { before: 600, after: 600 },
            }),

            // C.A. SHAHUL HAMEED with spacing
            new Paragraph({
              children: [
                new TextRun({
                  text: "C.A. SHAHUL HAMEED",
                  bold: true,
                  size: 22, // Changed to 22
                  font: "Calibri",
                }),
              ],
              alignment: "left",
            }),

            // Managing Director with spacing
            new Paragraph({
              children: [
                new TextRun({
                  text: "Managing Director",
                  size: 22, // Changed to 22
                  font: "Calibri",
                  bold: true,

                }),
              ],
              alignment: "left",
              spacing: { after: 600 },
            }),

            // Unit name
            new Paragraph({
              children: [
                new TextRun({
                  text: `${emp.unitname}`,
                  bold: true,
                  size: 22, // Changed to 22
                  font: "Calibri",
                }),
              ],
              alignment: "left",
            }),

            // Date
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${this.formattedDate(this.currentDate)}`,
                  bold: true,
                  size: 22, // Changed to 22
                  font: "Calibri",
                }),
              ],
              alignment: "left",
            }),
          ],
        },
      ],
    });

    // Save the document as a .docx file
    Packer.toBlob(doc).then((blob) => {
      let employeeName = emp?.name || 'employee';
      let fileName = `${employeeName.replace(/\s+/g, '_')}_Exp-certificate.docx`;
      FileSaver.saveAs(blob, fileName);
    });
  }









  // Helper function to format dates
  formattedDate(date: any) {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }






  /**print experience certificate  */


  // Function to call the API and get payslip data
  fetchPaySlipData() {

    if (this.payslipfilter.invalid) {
      this.payslipfilter.markAllAsTouched()
      return;
    }

    const month = this.payslipfilter.get('month')?.value;
    const year = this.payslipfilter.get('year')?.value;

    const payload = {
      month: month,
      year: year,
      employeeid: this.employeeId
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/payslip/', payload).subscribe((response: any) => {

      if (response['response'] === 'Success') {
        this.Loader = false;
        this.paySlipList = response.payslip;
        console.log('paylsip', this.paySlipList);


        this.generateExcelFile(month, year);
      } else if (response['response'] === 'Warning') {
        this.Loader = false
        this.toastrService.showWarning(response.message);
      } else {
        this.Loader = false
        this.toastrService.showError(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }


  // Function to generate and style the Excel file



  fetchtimesheetData() {

    if (this.timesheetForm.invalid) {
      this.timesheetForm.markAllAsTouched()
      return;
    }

    const month = this.timesheetForm.get('month')?.value;
    const payload = {
      monthyear: month,
      empid: this.employeeId
    };

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/employeereport/', payload).subscribe((response: any) => {

      if (response['response'] === 'Success') {
        this.Loader = false;
        this.timesheetList = response.data;
        console.log('attendance', this.timesheetList);


        this.generatetimesheetExcel(month);
      } else if (response['response'] === 'Warning') {
        this.Loader = false
        this.toastrService.showWarning(response.message);
      } else {
        this.Loader = false
        this.toastrService.showError(response.message);
      }
    },
      (error) => {
        this.Loader = false;
        console.error("Error occurred:", error);
        this.toastrService.showError("Something went wrong. Please try again later");
      });
  }


  generatetimesheetExcel(month: string) {
    if (!this.timesheetList || this.timesheetList.length === 0) {
      this.toastrService.showError("No data available to export.");
      return;
    }

    const empId = this.timesheetList[0]?.empid || 'N/A';
    const empName = this.timesheetList[0]?.empname || 'N/A';
    const year = new Date().getFullYear();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Timesheet');

    // Set 31 equal-width columns (Day 1 - Day 31)
    worksheet.columns = Array(31).fill({ width: 7 });

    // Row 1: Company Heading
    worksheet.mergeCells(1, 1, 1, 31); // A1:AE1
    const mainHeadingCell = worksheet.getCell('A1');
    mainHeadingCell.value = "AZOOMIE - BABY CARE";
    mainHeadingCell.font = { bold: true, size: 16 };
    mainHeadingCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    for (let col = 1; col <= 31; col++) {
      worksheet.getRow(1).getCell(col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '93C572' }, // Light Green
      };
    }

    // Row 2: Employee Info
    worksheet.mergeCells(2, 1, 2, 31); // A2:AE2
    const empInfoCell = worksheet.getCell('A2');
    empInfoCell.value = `Month: ${month} | Employee ID: ${empId} | Employee Name: ${empName}`;
    empInfoCell.font = { bold: true, size: 12 };
    empInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 25;

    for (let col = 1; col <= 31; col++) {
      worksheet.getRow(2).getCell(col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C6E0B4' }, // Light Green
      };
    }

    // Row 3: Header Row (Day 1 to Day 31)
    const headers = Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0070C0' }, // Blue
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Data Rows
    this.timesheetList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.day1, item.day2, item.day3, item.day4, item.day5,
        item.day6, item.day7, item.day8, item.day9, item.day10,
        item.day11, item.day12, item.day13, item.day14, item.day15,
        item.day16, item.day17, item.day18, item.day19, item.day20,
        item.day21, item.day22, item.day23, item.day24, item.day25,
        item.day26, item.day27, item.day28, item.day29, item.day30,
        item.day31
      ]);

      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Freeze first two rows
    worksheet.views = [
      { state: 'frozen', ySplit: 2 }
    ];

    // Export file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, `Timesheet_${month}_${year}.xlsx`);
    }).catch((err) => {
      console.error("Error writing file:", err);
    });
  }












  /*  paylsip  */


  generateExcelFile(month: string, year: string) {
    this.Loader = false;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('PaySlip');

    const emp = this.paySlipList[0];

    worksheet.columns = [
      { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }
    ];

    // --- Title Row ---
    worksheet.mergeCells('A1:D1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = `SALARY SLIP / ${year}`;
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.addRow([]);

    // === EMPLOYEE INFO SECTION ===
    const empRows = [
      ['Employ ID', emp.employeeid, 'Employ Name', emp.empname],
      ['Designation', emp.designation, 'Month', emp.month]
    ];
    empRows.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      row.eachCell((cell, col) => {
        cell.font = { bold: col % 2 === 1 }; // make only title cells bold
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    worksheet.addRow([]);

    // === EARNINGS & DEDUCTIONS SECTION ===
    const header = worksheet.addRow(['Earnings', '', 'Deduction', '']);
    header.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    const payData = [
      ['Basic', emp.basicda || 0, 'Mob.', 0],
      ['DA', emp.da || 0, 'Uni.', 0],
      ['HRA', emp.hra || 0, 'ADV.', emp.advancesalary || 0],
      ['TA', emp.ta || 0, 'HRA', 0],
      ['-', '', 'FINE', emp.fine || 0],
      ['-', '', 'LOP', emp.lop || 0],
      ['-', '', '-', '']
    ];

    payData.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      row.eachCell((cell, col) => {
        cell.font = { bold: col % 2 === 1 ? false : true }; // only keys bold
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // Total Row
    const totalRow = worksheet.addRow(['TOTAL', `₹ ${emp.total_earnings || 0}`, 'TOTAL', `₹ ${emp.totaldeduction || 0}`]);
    totalRow.eachCell((cell, col) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    worksheet.addRow([]);

    // Net Salary Row
    const netRow = worksheet.addRow(['Net Salary', '', '', `₹ ${emp.salary || 0}`]);
    worksheet.mergeCells(`B${netRow.number}:C${netRow.number}`);
    netRow.getCell(1).font = { bold: true };
    netRow.eachCell(cell => {
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Daily Wages Row
    const dailyRow = worksheet.addRow(['Daily Wages', '', '', emp.basicsalary || 0]);
    worksheet.mergeCells(`B${dailyRow.number}:C${dailyRow.number}`);
    dailyRow.getCell(1).font = { bold: true };
    dailyRow.eachCell(cell => {
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    worksheet.addRow([]);

    // === WORKING HOURS SECTION ===
    const workData = [
      ['Total Hours', emp.total_hours || 0, 'Working Hrs.', emp.workinghours || 0],
      ['OT Hrs', emp.ot_hours || 0, 'Working Days', emp.presentdays || 0]
    ];

    workData.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      row.eachCell((cell, col) => {
        cell.font = { bold: col % 2 === 1 ? false : true };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    worksheet.addRow([]);

    // === SIGNATURE ROW ===
    const sigRow = worksheet.addRow(['Employee Signature..........', '', 'Manager Signature..........']);
    sigRow.getCell(1).font = { italic: true };
    sigRow.getCell(3).font = { italic: true };

    // Save the file
    const employeeName = this.EmpDetailsList[0]?.name || 'employee';
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, `${employeeName}_PaySlip_${month}_${year}.xlsx`);
    });
  }




  // resign letter 
  resignationData: any = null;

  submitResignation() {
    if (this.resignationForm.invalid) {
      this.resignationForm.markAllAsTouched();
      return;
    }

    const payload = {
      resigneddate: this.resignationForm.get('resignDate')?.value,
      resignreason: this.resignationForm.get('reason')?.value,
      employeeid: this.employeeId,
    };


    this.Loader = true;
   this.apiService.postData(environment.apiUrl + '/api/resign/', payload)
      .subscribe(
        (response: any) => {
          this.Loader = false;

          if (response?.response === 'Success') {
            this.toastrService.showSuccess('Resignation submitted successfully');
            this.resignationData = response.employee?.[0] || {};

            // Close form modal
            const formModalEl = document.getElementById('resignationModal');
            if (formModalEl) {
              const modalInstance = bootstrap.Modal.getInstance(formModalEl);
              modalInstance?.hide();
            }

            // Open letter modal
            setTimeout(() => {
              const letterModal = new bootstrap.Modal(document.getElementById('resignationLetterModal')!);
              letterModal.show();
            }, 300);
          } else if (response?.response === 'Warning') {
            this.toastrService.showWarning(response.message);
          } else {
            this.toastrService.showError(response.message);
          }
        },
        (error) => {
          this.Loader = false;
          console.error('Error occurred:', error);
          this.toastrService.showError('Something went wrong. Please try again later');
        }
      );
  }


downloadLetterPdf() {
  const element = document.getElementById('letterContent');

  if (!element || !this.resignationData) {
    this.toastrService.showError('Resignation letter content or data not found.');
    return;
  }

  // Temporarily adjust styles for export
  const modalContent = element.closest('.modal-content') as HTMLElement;
  const originalPadding = modalContent?.style.padding;
  const originalFontSize = element.style.fontSize;

  if (modalContent) modalContent.style.padding = '0';
  element.style.fontSize = '14px'; // shrink text

  html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multipage
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Resignation_Letter_${this.resignationData.employeeId}.pdf`);

    // Restore original styles
    if (modalContent) modalContent.style.padding = originalPadding || '15px';
    element.style.fontSize = originalFontSize || '';
  });
}





  onModalHidden() {
    this.reloadCurrentPage();
  }


  reloadCurrentPage() {
    window.location.reload();
  }
}
