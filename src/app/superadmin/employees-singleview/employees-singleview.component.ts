import { ApiService } from '../../core/services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastService } from '../../core/services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TableComponent } from '../../commoncomponents/table/table.component';

import { ElementRef, ViewChild } from '@angular/core';
import {  FormControl } from '@angular/forms';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ErrorHandlingService } from '../../core/services/error-handling.service';


@Component({
  selector: 'app-employees-singleview',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
      CommonModule,
      FormsModule],
  templateUrl: './employees-singleview.component.html',
  styleUrl: './employees-singleview.component.css'
})
export class EmployeesSingleviewComponent {
 



  @ViewChild('fileInput') fileInput!: ElementRef;
  showIconupload = true;
  showImageBox = false;
  showIconClose = false;
  // imagePreview: string | ArrayBuffer | null = null;
  imagePreview: SafeUrl | null = null;
  selectedFile: File | null = null;

  showFirstForm: boolean = true;

  token: any;
  type: any;
  loginId: any;
  userName: any;
  EmailId: any;
  status: any;
  loginbrowser: any;
  Loader: boolean | undefined;

  statetId: any;
  DisID: any;
  Did: any;
  countryId: any;
  districtId: any;
  deptId: any;
  desigId: any;
  workId: any;

  countrylist: any = [];
  statelist: any = [];
  districtlist: any = [];
  departmentlist: any = [];
  designationlist: any = [];
  worklocationlist: any = [];
  employeelist: any = [];
  currentDate!: string;

  fileControl = new FormControl(null);

  EmployeeForm!: FormGroup;

  employeeId: any;
  id: any;

  apiurl: any = environment.apiUrl;

  isMonthlySalary = true;
  isDailyWages = false;
  showFields = false;
  ikkamaFileUrl: string | null = null;
  baladyFileUrl: string | null = null;
  passportFileUrl: string | null = null;
  contractFileUrl: string | null = null;
  storedLang: any;
  emp: any;
  profileimgurl: any;
  priviewImage1: any;
  showPassword: boolean = false;


  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router,
    private sanitizer: DomSanitizer, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService
  ) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.type = sessionStorage.getItem("type");
    this.loginId = sessionStorage.getItem("loginId");
    this.userName = sessionStorage.getItem("EmailId");
    this.EmailId = sessionStorage.getItem("userName");
    this.status = sessionStorage.getItem("status");
    this.loginbrowser = sessionStorage.getItem("loginbrowser");

    this.EmployeeForm = this.formBuilder.group({

      Name: [''],
      Gender: [''],
      kotkotid: [''],
      EmployeeID: [''],
      EmpType: [''],
      ContactNo: [''],
      DOB: [''],
      Age: [''],
      Email: [''],
      FatherName: [''],
      BloodGroup: [''],
      Qualification: [''],
      Address: [''],
      Department: [''],
      MaritalStatus: [''],
      SpouceName: [''],
      Location: [''],
      restaurant: [''],
      Designation: [''],
      salaryDate: [''],
      Shift: [''],
      country: [''],
      state: [''],
      district: [''],
      PassportNumber: [''],
      Passportexpiry: [''],

      Baladyno: [''],
      BaladyExpiry: [''],

      IkkamaNo: [''],
      IkkamaExpiry: [''],

      validid: [''],
      DIssueExp: [''],
      PFNumber: [''],
      UAN: [''],
      IPNumber: [''],
      BasicSalary: [''],
      monthlyworkingdays: [''],
      PFCheckbox: [false],
      PFpercentage: [{ value: '', disabled: false }],
      ESICheckbox: [false],
      ESIpercentage: [{ value: '', disabled: true }],
      DA: [''],
      HRA: [''],
      TA: [''],
      FoodAllowance: [''],
      ExtraAllowance: [''],
      BankName: [''],
      AccNumber: [''],
      IFSCcode: [''],
      Branch: [''],
      JoiningDate: [''],
      OT: [''],
      salaryType: [''],

      CasualLeaveEnabled: [],
      CasualLeave: [''],
      MedicalLeaveEnabled: [],
      MedicalLeave: [''],
      punchStatus: [],
      Type: [''],

      username: [''],
      password: [''],
    });



    this.EmployeeForm.get('CasualLeaveEnabled')?.disable();
    this.EmployeeForm.get('MedicalLeaveEnabled')?.disable();
    this.EmployeeForm.get('punchStatus')?.disable();

     this.EmployeeForm.get('PFCheckbox')?.disable();
    this.EmployeeForm.get('ESICheckbox')?.disable();


    this.EmployeeForm.get('DOB')!.valueChanges.subscribe(value => {
      if (value) {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        // Update the Age form control value
        this.EmployeeForm.get('Age')!.setValue(age);

      }
    });

    this.id = sessionStorage.getItem("singleviewid")
    this.employeeId = sessionStorage.getItem("employeeId")
      this.getEmployeeById();

    // this.commonService.getLanguageChangeObservable().subscribe(() => {
    //   this.storedLang = localStorage.getItem('LANG') || 'en';
    //   this.getEmployeeById();
    // });


    setTimeout(() => {
      this.Loader = false;
    }, 3000);
  }



  maxDateValidator() {
    return (control: any) => {
      const selectedDate = new Date(control.value);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        return { maxDate: true };
      }
      return null;
    };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }



  ikkamaFileName: string = '';
  baladyFileName: string = '';
  passportFileName: string = '';
  contractFileName: string = '';


  extractFileName(filePath: string): string {
    return filePath ? filePath.split('/').pop() || '' : '';
  }

  getEmployeeById() {
    this.Loader = true;
     this.apiService.postData(`${this.apiurl}codspropay/api/getemployeebyid/`, { id: this.id, employeeId: this.employeeId, language: this.storedLang }).subscribe((response: any) => {
        this.Loader = false;
        if (response.response === 'Success') {
          this.employeelist = response['employeelist'] // Assign the employee data to `this.emp`




          this.emp = this.employeelist[0];

          console.log(this.emp);


          this.profileimgurl = this.emp.profileimgurl;


          // Construct the full image URL
          const profileImageUrl = this.emp.profileimgurl ? `${this.apiurl}${this.emp.profileimgurl}` : null;
          this.imagePreview = profileImageUrl ? this.sanitizer.bypassSecurityTrustUrl(profileImageUrl) : null;
          this.showImageBox = !!profileImageUrl;

          // this.contractfilename = this.extractFileName(this.emp.contractdetailsurl);
          this.ikkamaFileName = this.extractFileName(this.emp.ikkamaurl);
          this.baladyFileName = this.extractFileName(this.emp.baladyurl);
          this.passportFileName = this.extractFileName(this.emp.passporturl);
          this.contractFileName = this.extractFileName(this.emp.contractdetailsurl);



          // Construct URLs and assign them to properties
          this.ikkamaFileUrl = this.emp.ikkamaurl ? `${this.apiurl}${this.emp.ikkamaurl}` : null;
          this.baladyFileUrl = this.emp.baladyurl ? `${this.apiurl}${this.emp.baladyurl}` : null;
          this.passportFileUrl = this.emp.passporturl ? `${this.apiurl}${this.emp.passporturl}` : null;
          this.contractFileUrl = this.emp.contractdetailsurl ? `${this.apiurl}${this.emp.contractdetailsurl}` : null;

          // Update individual form controls
          this.EmployeeForm.controls['EmpType'].setValue(this.emp.role);
          this.EmployeeForm.controls['Name'].setValue(this.emp.name);
          this.EmployeeForm.controls['kotkotid'].setValue(this.emp.ikkamaId);
          this.EmployeeForm.controls['EmployeeID'].setValue(this.emp.employeeId);
          this.EmployeeForm.controls['ContactNo'].setValue(this.emp.contactNo);
          this.EmployeeForm.controls['DOB'].setValue(this.emp.dob);
          this.EmployeeForm.controls['Age'].setValue(this.emp.age);
          this.EmployeeForm.controls['Gender'].setValue(this.emp.gender);
          this.EmployeeForm.controls['Email'].setValue(this.emp.email);
          this.EmployeeForm.controls['country'].setValue(this.emp.country_name);
          this.EmployeeForm.controls['state'].setValue(this.emp.state_name);
          this.EmployeeForm.controls['district'].setValue(this.emp.district_name);
          this.EmployeeForm.controls['FatherName'].setValue(this.emp.fathername);
          this.EmployeeForm.controls['BloodGroup'].setValue(this.emp.bloodgroup);
          this.EmployeeForm.controls['Qualification'].setValue(this.emp.qualification);
          this.EmployeeForm.controls['Address'].setValue(this.emp.address);
          this.EmployeeForm.controls['MaritalStatus'].setValue(this.emp.maritalstatus);
          this.EmployeeForm.controls['SpouceName'].setValue(this.emp.spoucename);
          this.EmployeeForm.controls['Department'].setValue(this.emp.department_name);
          this.EmployeeForm.controls['Designation'].setValue(this.emp.designation_name);
          this.EmployeeForm.controls['Location'].setValue(this.emp.worklocation_name);
          // this.EmployeeForm.controls['ContractDetails'].setValue(this.emp.contractdetailsurl);
          this.EmployeeForm.controls['JoiningDate'].setValue(this.emp.joiningdate);
          this.EmployeeForm.controls['PassportNumber'].setValue(this.emp.passportNo);
          // this.EmployeeForm.controls['PassportImage'].setValue(this.emp.passporturl ? `${this.apiurl}${this.emp.passporturl}` : null);
          this.EmployeeForm.controls['Passportexpiry'].setValue(this.emp.passportexpiredate);
          this.EmployeeForm.controls['Baladyno'].setValue(this.emp.baladyNo);
          // this.EmployeeForm.controls['BaladyImage'].setValue(this.emp.baladyurl ? `${this.apiurl}${this.emp.baladyurl}` : null);
          this.EmployeeForm.controls['BaladyExpiry'].setValue(this.emp.baladyexpiredate);
          this.EmployeeForm.controls['IkkamaNo'].setValue(this.emp.ikkamaNo);
          // this.EmployeeForm.controls['IkkamaImage'].setValue(this.emp.ikkamaurl ? `${this.apiurl}${this.emp.ikkamaurl}` : null);
          this.EmployeeForm.controls['IkkamaExpiry'].setValue(this.emp.ikkamaexpiredate);
          this.EmployeeForm.controls['validid'].setValue(this.emp.otherIdNo);
          this.EmployeeForm.controls['DIssueExp'].setValue(this.emp.otherIdExpiry);
          this.EmployeeForm.controls['BasicSalary'].setValue(this.emp.basicsalary);
          // this.EmployeeForm.controls['PFpercentage'].setValue(this.emp.pfamount);
          // this.EmployeeForm.controls['ESIpercentage'].setValue(this.emp.esi);
          this.EmployeeForm.controls['DA'].setValue(this.emp.da);
          this.EmployeeForm.controls['HRA'].setValue(this.emp.hra);
          this.EmployeeForm.controls['TA'].setValue(this.emp.ta);
          this.EmployeeForm.controls['BankName'].setValue(this.emp.bankname);
          this.EmployeeForm.controls['AccNumber'].setValue(this.emp.accountnumber);
          this.EmployeeForm.controls['IFSCcode'].setValue(this.emp.ifsccode);
          this.EmployeeForm.controls['Branch'].setValue(this.emp.branch);
          this.EmployeeForm.controls['Shift'].setValue(this.emp.shiftid);
          this.EmployeeForm.controls['salaryDate'].setValue(this.emp.salarydate);
          this.EmployeeForm.controls['monthlyworkingdays'].setValue(this.emp.monthlyworkingdays);

          this.EmployeeForm.controls['PFNumber'].setValue(this.emp.pfno);
          this.EmployeeForm.controls['UAN'].setValue(this.emp.uanno);
          this.EmployeeForm.controls['IPNumber'].setValue(this.emp.ipno);

          this.EmployeeForm.controls['FoodAllowance'].setValue(this.emp.foodallowance);
          this.EmployeeForm.controls['ExtraAllowance'].setValue(this.emp.extraallowance);

          console.log('Salary type from API:', this.emp.salarytype);


          const salaryType = this.emp.salarytype?.trim().toLowerCase(); 
          this.EmployeeForm.controls['salaryType'].setValue(salaryType);

          this.EmployeeForm.controls['salaryType'].disable();


          // pf
          if (this.emp.ispf === 'Yes') {
            this.EmployeeForm.controls['PFCheckbox'].setValue(true);
            this.EmployeeForm.controls['PFpercentage'].setValue(this.emp.pfamount);
          } else {
            this.EmployeeForm.controls['PFCheckbox'].setValue(false);
            this.EmployeeForm.controls['PFpercentage'].setValue(null);
          }

          // esi
          if (this.emp.isesi === 'Yes') {
            this.EmployeeForm.controls['ESICheckbox'].setValue(true);
            this.EmployeeForm.controls['ESIpercentage'].setValue(this.emp.esi);
          } else {
            this.EmployeeForm.controls['ESICheckbox'].setValue(false);
            this.EmployeeForm.controls['ESIpercentage'].setValue(null);
          }



          // Casual Leave
          if (this.emp.iscasual === 'Yes') {
            this.EmployeeForm.controls['CasualLeaveEnabled'].setValue(true);
            this.EmployeeForm.controls['CasualLeave'].setValue(this.emp.leavedays);
          } else {
            this.EmployeeForm.controls['CasualLeaveEnabled'].setValue(false);
            this.EmployeeForm.controls['CasualLeave'].setValue(null);
          }

          // Medical Leave
          if (this.emp.ismedical === 'Yes') {
            this.EmployeeForm.controls['MedicalLeaveEnabled'].setValue(true);
            this.EmployeeForm.controls['MedicalLeave'].setValue(this.emp.medicalleave);
          } else {
            this.EmployeeForm.controls['MedicalLeaveEnabled'].setValue(false);
            this.EmployeeForm.controls['MedicalLeave'].setValue(null);
          }

          // Punch
          this.EmployeeForm.controls['punchStatus'].setValue(this.emp.ispunch === 'Yes');

          // Step 1 → Convert API string to array
          const apiType = this.emp.type; // e.g. "WareHouse,Accounts"

          const apiTypesArray = apiType
            ? apiType.split(',').map((item: string) => item.trim())
            : [];

          // Step 2 → patch array value
          this.EmployeeForm.controls['Type'].setValue(apiTypesArray);


          console.log('emp type---------', this.emp.type);

          this.EmployeeForm.controls['username'].setValue(this.emp.username);
          this.EmployeeForm.controls['password'].setValue(this.emp.password);

          this.EmployeeForm.controls['restaurant'].setValue(this.emp.restaurant_name);






        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }
  /**
 * get employee by id 
 */



  openFile(filePath: string | null) {
    if (filePath) {
      window.open(filePath, '_blank');
    } else {
      this.toastrService.showError('File not found.');
    }
  }

  closeform() {
    this.router.navigateByUrl('superadmin/view-employee')
  }


  showNextForm() {
    this.showFirstForm = false;

  }

  goToFirstForm() {
    this.showFirstForm = true;
  }



  reloadCurrentPage() {
    window.location.reload();
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

}
