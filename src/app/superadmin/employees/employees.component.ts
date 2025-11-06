import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
    CommonModule, NgSelectModule,
    FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {
  selectedfile!: File;
  imagePreview: SafeUrl | null = null;
  showImageBox: boolean = false;
  showIconupload: boolean = true;
  showIconClose: boolean = false;

  showFirstForm: boolean = true;

  selectedFileadhar: File | null = null;
  selectedFilepan: File | null = null;
  selectedFilevisa: File | null = null;
  selectedFileid: File | null = null;
  selectedFiledriving: File | null = null;

  EmployeeForm!: FormGroup;
  FamilyMembers!: FormGroup;
  // EditFamilyDetailsForm!: FormGroup;


  currentDate!: string;
  Loader: boolean = false;
  Employee_Id: any;
  Gender: any;
  Company_ArrayList: any = [];
  Company_Id: any;
  Department_ArrayList: any = [];
  Dept_ID: any;
  Designation_List: any = [];
  Designationt_ID: any;
  Blood_Group: any;
  Maritalstatus: any;
  Relation: any;

  blnForDelete: boolean = true;
  blnHasSingleview: boolean = false;
  blnNoEdit: boolean = true;


  arrList: any = [];
  pfesi: any = []
  isPfInputReadOnly: boolean = true;
  isEsiInputReadOnly: boolean = true;

  isPFChecked = false;
  isESIChecked = false;

  Delete_item: any;

  // familyDetailsArray: FamilyMember[] = [];
  apiurl: any = environment.apiUrl;

  first = 0;
  rows = 10;
  deleteCountryModal: boolean = false;
  EditModal: boolean = false;
  selectedFamilyMemberId: any;

  isMonthlySalary = true;
  isDailyWages = false;
  showFields = false;

  errorMessage: string | null = null;

  passwordVisible = false;
  EmpType: any;
  ShiftList: any = [];
  Shift_ID: any;
  countrylist: any = [];
  statelist: any = [];
  districtlist: any = [];

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  showCasualLeave: boolean = false;
  showMedicalLeave: boolean = false;
  casualEnabled: boolean = false;
  medicalEnabled: boolean = false;
  statetId: any;
  countryId: any;
  districtId: any;
  RestaurantList: any = [];
  restaurantId: any;
  worklocationlist: any = [];
  workId: any;
  adminId: any;
  storedLang: any;
  emp: any;

  selectedFileIkkama: File | null = null;
  ikkamaFileName: string | null = null;
  selectedFilePassport: File | null = null;
  passportFileName: string | null = null;
  selectedFileBalady: File | null = null;
  baladyFileName: string | null = null;
  selectedFilecontract: File | null = null;
  contractFileName: string | null = null;
  employeelist: any = [];

  ikkamaFileUrl: string | null = null;
  baladyFileUrl: string | null = null;
  passportFileUrl: string | null = null;
  contractFileUrl: string | null = null;
  profileimgurl: any;
  priviewImage1: any;
  isEditMode: boolean = false;
  id: any;

  // arrColumns: any = [
  //   { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
  //   { strHeader: "Name", strAlign: "center", strKey: "name" },
  //   { strHeader: "Date Of Birth", strAlign: "center", strKey: "dob" },
  //   { strHeader: "Relation", strAlign: "center", strKey: "relation" },
  //   { strHeader: "Aadhar No", strAlign: "center", strKey: "adharno" },
  //   { strHeader: "Actions", strAlign: "center", strKey: "strActions" },
  // ];

  userTypes = [
    { label: 'HR', value: 'HR' },
    { label: 'RestaurantManager', value: 'RestaurantManager' },
    { label: 'PurchaseManager', value: 'PurchaseManager' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Staff', value: 'Staff' },
    { label: 'KitchenStaff', value: 'KitchenStaff' },
    { label: 'ProductionHouse', value: 'ProductionHouse' },
    { label: 'Godown', value: 'GodownManager' },
    { label: 'WareHouse', value: 'WareHouse' },
    { label: 'Accounts', value: 'Accounts' }
  ];



  constructor(private sanitizer: DomSanitizer, private formBuilder: FormBuilder, private apiService: ApiService, private router: Router, private route: ActivatedRoute, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) {

  }



  ngOnInit(): void {

    this.adminId = sessionStorage.getItem("adminId");
    this.currentDate = new Date().toISOString().split('T')[0];

    this.EmployeeForm = this.formBuilder.group({

      Name: ['', Validators.required],
      Gender: ['', Validators.required],
      kotkotid: [''],
      EmployeeID: ['', Validators.required],
      EmpType: [''],
      ContactNo: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      DOB: ['', [Validators.required, this.maxDateValidator()]],
      Age: [''],
      Email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      FatherName: [''],
      BloodGroup: [''],
      Qualification: [''],
      Address: ['', Validators.required],
      Department: ['', Validators.required],
      MaritalStatus: [''],
      SpouceName: [''],
      Location: ['', Validators.required],
      restaurant: ['', Validators.required],
      Designation: ['', Validators.required],
      salaryDate: ['', Validators.required],
      // Shift: ['', Validators.required],
      Shift: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
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
      BasicSalary: ['', Validators.required],
      monthlyworkingdays: ['', Validators.required],
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
      JoiningDate: ['', Validators.required],
      OT: ['Yes', Validators.required],
      salaryType: ['monthly'],

      CasualLeaveEnabled: [false],
      CasualLeave: [''],
      MedicalLeaveEnabled: [false],
      MedicalLeave: [''],
      punchStatus: [false],
      Type: ['', Validators.required],

      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
    });

    // this.EditFamilyDetailsForm = this.formBuilder.group({
    //   name: [''],
    //   dob: [''],
    //   relation: [''],
    //   adharno: ['', [Validators.pattern('^[2-9]{1}[0-9]{11}$')]],
    // });




    // Reset leave input when checkbox is unchecked
    this.EmployeeForm.get('CasualLeaveEnabled')?.valueChanges.subscribe(checked => {
      if (!checked) this.EmployeeForm.get('CasualLeave')?.reset('');
    });

    this.EmployeeForm.get('MedicalLeaveEnabled')?.valueChanges.subscribe(checked => {
      if (!checked) this.EmployeeForm.get('MedicalLeave')?.reset('');
    });

    // Subscribe to changes in the DOB field to update the Age field
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
    // this.FamilyMembers = this.formBuilder.group({
    //   name: ['', Validators.required],
    //   dob: [''],
    //   relation: ['', Validators.required],
    //   adharno: ['', [Validators.pattern('^[2-9]{1}[0-9]{11}$')]],
    // });



    // this.EmployeeForm.get('BasicSalary')?.valueChanges.subscribe(value => {
    //   if (this.isPFChecked) {
    //     this.EmployeeForm.get('PFpercentage')?.setValue(value);
    //   }
    // });

    // this.commonService.getLanguageChangeObservable().subscribe(() => {
    //   this.storedLang = localStorage.getItem('LANG') || 'en';
    this.onSalaryTypeChange('monthly');
    this.getCountryByStatusFn();
    this.getWorklocationByStatusFn();
    this.FetchRestuarantFn();
    this.getDepartmentByStatusFn();
    this.get_shift();
    this.getDesignationByStatusFn();



    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const empid = params['empid'];

      this.isEditMode = !!(id);
      if (id) {
        this.getEmployeeById(id, empid);
      }
    });




  }

  limitLength(event: any, max: number) {
    if (event.target.value.length > max) {
      event.target.value = event.target.value.slice(0, max);
      event.target.dispatchEvent(new Event('input')); // update form value
    }
  }



  // Passport Image
  selectedFilepassport: File | null = null;
  onPassportSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png')) {
      this.selectedFilepassport = file;
      this.passportFileName = file.name;
      console.log('Selected passport file:', file.name);
    } else {
      this.selectedFilepassport = null;
      console.log('Unsupported file format for passport. Please select a PDF or image file.');
      this.toastrService.showWarning('Only PDF and image files (JPG, PNG) are supported for passport. Please select a valid file.');
    }
  }

  // Balady URL File
  selectedFilebaladyurl: File | null = null;
  onBaladySelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png')) {
      this.selectedFilebaladyurl = file;
      this.baladyFileName = file.name;
      console.log('Selected file for Balady:', file.name);
    } else {
      this.selectedFilebaladyurl = null;
      console.log('Unsupported file format for Balady. Please select a PDF or image file.');
      this.toastrService.showWarning('Only PDF and image files (JPG, PNG) are supported for Balady. Please select a valid file.');
    }
  }

  // Ikkama URL File
  ikkamaurl: File | null = null;
  onIkkamaSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png')) {
      this.ikkamaurl = file;
      this.ikkamaFileName = file.name;
      console.log('Selected Ikkama file:', file.name);
    } else {
      this.ikkamaurl = null;
      console.log('Unsupported file format for Ikkama. Please select a PDF or image file.');
      this.toastrService.showWarning('Only PDF and image files (JPG, PNG) are supported for Ikkama. Please select a valid file.');
    }
  }


  // 👁 Preview function
  previewPassportFile(): void {

    if (this.selectedFilePassport) {
      // Open the newly uploaded file (temporary URL)
      const fileUrl = URL.createObjectURL(this.selectedFilePassport);
      window.open(fileUrl, '_blank');

      // Optional: revoke the object URL after some time to free memory
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } else if (this.passportFileUrl) {
      // Open the file from database if no new file is uploaded
      window.open(this.passportFileUrl, '_blank');
    }

  }
  // 👁 Preview function
  previewBaladyFile(): void {

    if (this.selectedFileBalady) {
      // Open the newly uploaded file (temporary URL)
      const fileUrl = URL.createObjectURL(this.selectedFileBalady);
      window.open(fileUrl, '_blank');

      // Optional: revoke the object URL after some time to free memory
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } else if (this.baladyFileUrl) {
      // Open the file from database if no new file is uploaded
      window.open(this.baladyFileUrl, '_blank');
    }

  }


  // 👁 Preview function
  previewIkkamaFile(): void {
    if (this.selectedFileIkkama) {
      // Open the newly uploaded file (temporary URL)
      const fileUrl = URL.createObjectURL(this.selectedFileIkkama);
      window.open(fileUrl, '_blank');

      // Optional: revoke the object URL after some time to free memory
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } else if (this.ikkamaFileUrl) {
      // Open the file from database if no new file is uploaded
      window.open(this.ikkamaFileUrl, '_blank');
    }
  }

  previewContractFile(): void {

    if (this.selectedFilecontract) {
      // Open the newly uploaded file (temporary URL)
      const fileUrl = URL.createObjectURL(this.selectedFilecontract);
      window.open(fileUrl, '_blank');

      // Optional: revoke the object URL after some time to free memory
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } else if (this.contractFileUrl) {
      // Open the file from database if no new file is uploaded
      window.open(this.contractFileUrl, '_blank');
    }

  }


  /**
   * 
   * get active work loaction
   */

  selectWorkLocation(event: any) {
    this.workId = event.target.value;
  }
  getWorklocationByStatusFn() {

    this.Loader = true;

     this.apiService.postData(environment.apiUrl + '/api/getactiveworklocation/', { empid: this.adminId, language: this.storedLang })
      .subscribe({
        next: (response) => {
          this.Loader = false;
          if (response.response === 'Success') {
            this.worklocationlist = response.worklocationlist;
          } else {
            this.toastrService.showError(response.message);
          }
        },
        error: (error) => {
          this.Loader = false;
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      });
  }

  /**
   * get active work loaction
   */

  selectRestaurant(event: any) {
    this.restaurantId = event.target.value;


  }



  FetchRestuarantFn() {

    this.Loader = true;

     this.apiService.postData(
      environment.apiUrl + '/api/getactive_restaurant/',
      { empid: this.adminId, language: this.storedLang }
    )
      .subscribe({
        next: (response) => {
          this.Loader = false;
          if (response.response === 'Success') {
            this.RestaurantList = response.restaurantactivelist;
          } else {
            this.toastrService.showError(response.message);
          }
        },
        error: (error) => {
          this.Loader = false;
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      });
  }



  onContarctSelected(event: any): void {
    const file: File = event.target.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file && allowedTypes.includes(file.type)) {
      this.selectedFilecontract = file;
      this.contractFileName = file.name; // ✅ update edit/display variable too
      console.log('Selected file:', file.name);
    } else {
      this.selectedFilecontract = null;
      console.log('Unsupported file format. Please select a PDF or image file.');
      this.toastrService.showWarning('Only PDF and image files (JPG, PNG) are supported. Please select a valid file.');
    }
  }


  toggleLeave(type: string) {
    if (type === 'casual') {
      this.casualEnabled = !this.casualEnabled;
      if (!this.casualEnabled) {
        this.EmployeeForm.get('CasualLeave')?.reset();
      }
    }
    if (type === 'medical') {
      this.medicalEnabled = !this.medicalEnabled;
      if (!this.medicalEnabled) {
        this.EmployeeForm.get('MedicalLeave')?.reset();
      }
    }
  }



  // Function to handle PF checkbox change
  onSalaryTypeChange(type: string) {
    if (type === 'monthly') {
      this.isMonthlySalary = true;
      this.isDailyWages = false;
    } else {
      this.isMonthlySalary = false;
      this.isDailyWages = true;
    }

    this.clearSalaryDetails();
  }

  clearSalaryDetails() {
    this.EmployeeForm.patchValue({
      BasicSalary: '',
      PFpercentage: '',
      ESIpercentage: '',
      DA: '',
      HRA: '',
      TA: '',
      PFCheckbox: '',
      ESICheckbox: ''
      // salaryType: ''
    });
    // Enable or disable controls based on salary type
    if (this.isMonthlySalary) {
      this.EmployeeForm.get('PFpercentage')?.enable();
      this.EmployeeForm.get('ESIpercentage')?.enable();
    } else {
      this.EmployeeForm.get('PFpercentage')?.disable();
      this.EmployeeForm.get('ESIpercentage')?.enable();
    }
  }


  togglePfField(event: any) {
    const isChecked = event.target.checked;
    const pfPercentageControl = this.EmployeeForm.get('PFpercentage');
    if (isChecked) {
      pfPercentageControl?.setValue(this.EmployeeForm.get('BasicSalary')?.value);
    } else {
      pfPercentageControl?.setValue('');
    }
  }

  toggleEsiField(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.getESIValue();
    } else {
      this.EmployeeForm.get('ESIpercentage')?.setValue('');
    }
  }


  togglePfFieldDaily(event: any) {
    // PF field is always disabled for Daily Wages
  }

  toggleEsiFieldDaily(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.getESIValue();
    } else {
      this.EmployeeForm.get('ESIpercentage')?.setValue('');
    }
  }



  getESIValue() {


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/activepfandesi/', { empid: this.adminId, language: this.storedLang }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        const pfEsiData = response.pf_esi[0];
        if (pfEsiData) {
          this.EmployeeForm.get('ESIpercentage')?.setValue(pfEsiData.esi);
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

  // Inside your component class

  // Step 1: Define which fields belong to Form 1
  form1Fields: string[] = [
    'Name',
    'Gender',
    'EmployeeID',
    'EmpType',
    'ContactNo',
    'DOB',
    'Age',
    'Email',
    'FatherName',
    'BloodGroup',
    'Qualification',
    'Address',
    'Department',
    'MaritalStatus',
    'Designation',
    'salaryDate',
    'Shift',
    'JoiningDate',
    'OT',
    'CasualLeave',
    'salaryType',
    'Location',
    'country',
    'state',
    'district',
    'restaurant'
  ];

  showNextForm() {
    // Step 2: Mark form1 controls as touched
    this.form1Fields.forEach(field => {
      this.EmployeeForm.get(field)?.markAsTouched();
    });

    // Step 3: Validate only form1 controls
    const form1Valid = this.form1Fields.every(
      field => this.EmployeeForm.get(field)?.valid
    );

    if (form1Valid) {
      this.showFirstForm = false;
    } else {
      console.log("Form 1 has errors, please fix before continuing.");
    }
  }

  onNameChange() {
    const nameValue = this.EmployeeForm.controls['Name'].value;

    const username = nameValue.replace(/\s+/g, '').toLowerCase();

    this.EmployeeForm.controls['username'].setValue(username);
  }


  goToFirstForm() {
    this.showFirstForm = true;
  }


  // employee image upload

  onFileUploaded(event: any) {
    const file = event.target.files[0];

    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();

      if (['jpeg', 'jpg', 'png'].includes(extension)) {
        this.selectedfile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
          this.showIconupload = !this.showIconupload;
          this.showImageBox = !this.showImageBox;
          this.showIconClose = !this.showIconClose;
        };
        reader.readAsDataURL(this.selectedfile);
      } else {
        this.toastrService.showWarning('Please select an image in JPEG, JPG, or PNG format.');
      }
    }
  }

  clearCard() {
    this.imagePreview = "";
    this.showIconupload = true;
    this.showImageBox = false;
    this.showIconClose = false;
  }





  clearForm1() {
    this.EmployeeForm.patchValue({
      EmployeeImage: '',
      Name: '',
      Gender: '',
      EmployeeID: '',
      ContactNo: '',
      DOB: '',
      Age: '',
      Email: '',
      FatherName: '',
      BloodGroup: '',
      Qualification: '',
      Address: '',
      Department: '',
      MaritalStatus: '',
      SpouceName: '',
      Designation: '',
      PFNumber: '',
      UAN: '',
      IPNumber: '',
      OT: '',
      JoiningDate: '',
      salaryDate: '',
      Shift: ''

    });
  }


  clearForm2() {
    this.EmployeeForm.patchValue({
      Adhar: '',
      Pan: '',
      Passport: '',
      DrivingLicence: '',

      AadharNumber: '',
      PanNumber: [''],

      PassportNumber: [''],
      VisaNumber: [''],
      DrivingLicenceNumber: [''],
      IDNumber: [''],

      PassportExpiry: [''],
      VisaExpiry: [''],
      LicenceExpiry: [''],
      IDExpiry: [''],

      BasicSalary: '',
      PFCheckbox: '',
      PFpercentage: '',
      ESICheckbox: '',
      ESIpercentage: '',
      DA: '',
      HRA: '',
      TA: '',
      FoodAllowance: '',
      ExtraAllowance: '',
      // FamilyName: '',
      // FamilyAge: '',
      // Relation: ''

    });

    //  this.selectedFileadhar = null;
    //  this.selectedFilepan = null;
    //  this.selectedFilepassport = null;
    //  this.selectedFilevisa = null;
    //  this.selectedFileid = null;
    //  this.selectedFiledriving = null;

  }

  selected_Gender(event: any, action: any) {
    this.Gender = event.target.value;
  }



  /**
* get active country
*/
  selectCountry(event: any) {
    this.countryId = event.target.value;
    this.fetchstate()
  }

  getCountryByStatusFn() {

    this.Loader = true;

     this.apiService.postData(
      environment.apiUrl + '/api/getactivecountry/',
      { empid: this.adminId, language: this.storedLang },
      
    )
      .subscribe({
        next: (response: any) => {
          this.Loader = false;
          if (response.response === 'Success') {
            this.countrylist = response.countrylist;
            if (this.countryId) {
            }
          } else {
            this.toastrService.showError(response.message);
          }
        },
        error: (error) => {
          this.Loader = false;
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
        }
      });
  }

  /**
   * get active country
   */



  /**
   * fet state by country id 
   */

  selectByState(event: any, action: any) {
    this.statetId = event.target.value;
    this.fetchDistrict();
  }

  fetchstate(callback?: () => void) {
    

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/viewstatebycountryid/', { countryid: this.countryId, empid: this.adminId, language: this.storedLang })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response.response === 'Success') {
          this.statelist = response.statelist;
          if (callback) callback();
        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }


  /**
   * fet state by country id 
   */



  /**
   * fetch district by state id
   */
  selectByDistrict(event: any, action: any) {
    this.districtId = event.target.value;
  }



  fetchDistrict(callback?: () => void) {
   

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getdistrictbystateid/', { stateid: this.statetId, language: this.storedLang, empid: this.adminId })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response.response === 'Success') {
          this.districtlist = response.districtlist;
          if (callback) callback();  // ✅ run after loading
        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }


  /**
   * get active department
   */
  selectDepartment(event: any) {
    this.Dept_ID = event.target.value;
  }

  getDepartmentByStatusFn() {

    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getactivedepartment/', { empid: this.adminId, language: this.storedLang })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response.response === 'Success') {
          this.Department_ArrayList = response.departmentlist;
        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        // Pass Loader reference to common service
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
      );
  }
  /**
   * get active department
   */


  /**
   * get active designation
   */
  selectDesignation(event: any) {
    this.Designationt_ID = event.target.value;
  }

  getDesignationByStatusFn() {
   
    this.Loader = true;
     this.apiService.postData(environment.apiUrl + '/api/getactivedesignation/', { empid: this.adminId, language: this.storedLang })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response.response === 'Success') {
          this.Designation_List = response.designationlist;
        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        // Pass Loader reference to common service
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
      );
  }


  selected_Shift(event: any, action: any) {
    this.Shift_ID = event.target.value;
  }

  get_shift() {

    this.Loader = true;

     this.apiService.postData(environment.apiUrl + 'codspropay/api/getactiveworkshift/', { empid: this.adminId, language: this.storedLang }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          const allShifts = response['workshiftlist'] || [];
          this.ShiftList = allShifts.filter((shift: any) => shift.status === 'Active');
        } else {
          this.handleErrorResponse(response);
        }
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      }
    );
  }



  selected_BloodGroup(event: any, action: any) {
    this.Blood_Group = event.target.value;
    console.log("Blood=", this.Blood_Group);

  }


  selected_emptype(event: any, action: any) {
    this.EmpType = event.target.value;
    console.log("EmpType=", this.EmpType);

  }


  Selected_MaritalStatus(event: any, action: any) {
    this.Maritalstatus = event.target.value;

    if (this.Maritalstatus === 'Unmarried') {
      this.EmployeeForm.controls['SpouceName'].disable();
    } else {
      this.EmployeeForm.controls['SpouceName'].enable();
    }
  }



  getEmployeeById(id: any, empid: any) {

    this.id = id


    this.Loader = true;
     this.apiService.postData(environment.apiUrl + 'codspropay/api/getemployeebyid/', { id: id, employeeId: empid, language: this.storedLang },
      ).subscribe((response: any) => {
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
          this.EmployeeForm.controls['country'].setValue(this.emp.countryId);
          this.EmployeeForm.controls['state'].setValue(this.emp.stateId);
          this.EmployeeForm.controls['district'].setValue(this.emp.districtId);
          this.EmployeeForm.controls['FatherName'].setValue(this.emp.fathername);
          this.EmployeeForm.controls['BloodGroup'].setValue(this.emp.bloodgroup);
          this.EmployeeForm.controls['Qualification'].setValue(this.emp.qualification);
          this.EmployeeForm.controls['Address'].setValue(this.emp.address);
          this.EmployeeForm.controls['MaritalStatus'].setValue(this.emp.maritalstatus);
          this.EmployeeForm.controls['SpouceName'].setValue(this.emp.spoucename);
          this.EmployeeForm.controls['Department'].setValue(this.emp.departmentId);
          this.EmployeeForm.controls['Designation'].setValue(this.emp.designationId);
          this.EmployeeForm.controls['Location'].setValue(this.emp.worklocationId);
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


          const salaryType = this.emp.salarytype?.trim().toLowerCase();
          this.EmployeeForm.controls['salaryType'].setValue(salaryType);

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


          this.Dept_ID = this.emp.departmentId;
          this.Gender = this.emp.gender;
          this.Designationt_ID = this.emp.designationId;
          this.Maritalstatus = this.emp.maritalstatus
          this.Blood_Group = this.emp.bloodgroup;

          this.Shift_ID = this.emp.shiftid;

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

          this.EmployeeForm.controls['restaurant'].setValue(this.emp.restaurantId);

          this.restaurantId = this.emp.restaurantId


          this.countryId = this.emp.countryId;
          this.statetId = this.emp.stateId;
          this.districtId = this.emp.districtId;

          // First load states
          this.fetchstate(() => {
            // After states are loaded, set state value
            this.EmployeeForm.controls['state'].setValue(this.statetId);

            // Now load districts
            this.fetchDistrict(() => {
              this.EmployeeForm.controls['district'].setValue(this.districtId);
            });
          });


        } else {
          this.toastrService.showError(response.message);
        }
      }, (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }

  extractFileName(filePath: string): string {
    return filePath ? filePath.split('/').pop() || '' : '';
  }

  // add employee

  addEmployee() {

Object.keys(this.EmployeeForm.controls).forEach(key => {
  const control = this.EmployeeForm.get(key);
  if (control && control.invalid) {
    console.log('❌ Invalid field:', key, control.errors);
  }
});

    if (this.EmployeeForm.invalid) {
      this.EmployeeForm.markAllAsTouched();
      this.toastrService.showError('Please fill out all required fields before submitting your registration.')
      return
    }


    this.errorMessage = null;
    const username = this.EmployeeForm.get('username')?.value;
    const password = this.EmployeeForm.get('password')?.value;

    if (this.showFields && (!username || !password)) {
      if (!username) {
        this.errorMessage = 'To proceed with the registration, please provide a username.';
      } else if (!password) {
        this.errorMessage = 'A secure password is required to protect your account. Please enter a password to continue.';
      }
      return;
    }

    var formdata = new FormData;


    const salaryType = this.EmployeeForm.get('salaryType')?.value || 'monthly';
    formdata.append('salarytype', salaryType);

    // If Edit Mode → append employee ID
    if (this.isEditMode && this.id) {
      formdata.append('id', this.id);
    }

    formdata.append('employeeId', this.EmployeeForm.controls['EmployeeID'].value);
    formdata.append('labourcardNo', this.EmployeeForm.controls['kotkotid'].value);

    formdata.append('worklocationId', this.EmployeeForm.controls['Location'].value);

    formdata.append('restaurantId', this.restaurantId || '');
    formdata.append('profileimgurl', this.selectedfile);
    formdata.append('name', this.EmployeeForm.controls['Name'].value);
    formdata.append('gender', this.Gender);
    formdata.append('contactNo', this.EmployeeForm.controls['ContactNo'].value);
    formdata.append('dob', this.EmployeeForm.controls['DOB'].value);
    formdata.append('age', this.EmployeeForm.controls['Age'].value || '');
    formdata.append('email', this.EmployeeForm.controls['Email'].value);
    formdata.append('fathername', this.EmployeeForm.controls['FatherName'].value);
    formdata.append('bloodgroup', this.EmployeeForm.controls['BloodGroup'].value);
    formdata.append('role',this.EmployeeForm.controls['EmpType'].value || '');
    formdata.append('qualification', this.EmployeeForm.controls['Qualification'].value);
    formdata.append('address', this.EmployeeForm.controls['Address'].value);
    formdata.append('unitId', this.Company_Id);
    formdata.append('departmentId', this.Dept_ID);
    formdata.append('shiftid', this.Shift_ID);
    formdata.append('maritalstatus', this.Maritalstatus);
    formdata.append('spoucename', this.EmployeeForm.controls['SpouceName'].value);
    formdata.append('designationId', this.Designationt_ID);
    formdata.append('foodallowance', this.EmployeeForm.controls['FoodAllowance'].value);
    formdata.append('extraallowance', this.EmployeeForm.controls['ExtraAllowance'].value);

    formdata.append('isOT', this.EmployeeForm.controls['OT'].value);
    formdata.append('leavedays', this.EmployeeForm.controls['CasualLeave'].value);


    const casualEnabled = this.EmployeeForm.controls['CasualLeaveEnabled'].value;
    const medicalEnabled = this.EmployeeForm.controls['MedicalLeaveEnabled'].value;


    // Casual leave
    formdata.append('iscasual', casualEnabled ? 'Yes' : 'No');
    formdata.append(
      'leavedays',
      casualEnabled ? this.EmployeeForm.controls['CasualLeave'].value || '0' : '0'
    );

    // Medical leave
    formdata.append('ismedical', medicalEnabled ? 'Yes' : 'No');
    formdata.append(
      'medicalleave',
      medicalEnabled ? this.EmployeeForm.controls['MedicalLeave'].value || '0' : '0'
    );

    // Punch status
    formdata.append('ispunch', this.EmployeeForm.controls['punchStatus'].value ? 'Yes' : 'No');


    formdata.append('passportNo', this.EmployeeForm.controls['PassportNumber'].value);
    formdata.append('passportexpiredate', this.EmployeeForm.controls['Passportexpiry'].value);
    formdata.append('baladyNo', this.EmployeeForm.controls['Baladyno'].value);
    formdata.append('baladyexpiredate', this.EmployeeForm.controls['BaladyExpiry'].value);
    formdata.append('ikkamaNo', this.EmployeeForm.controls['IkkamaNo'].value);
    formdata.append('ikkamaexpiredate', this.EmployeeForm.controls['IkkamaExpiry'].value);

    formdata.append('countryId', this.countryId);
    formdata.append('stateId', this.statetId);
    formdata.append('districtId', this.districtId);

    formdata.append('pfno', this.EmployeeForm.controls['PFNumber'].value);
    formdata.append('uanno', this.EmployeeForm.controls['UAN'].value);
    formdata.append('ipno', this.EmployeeForm.controls['IPNumber'].value);



    formdata.append('collectionamount', '0');

    if (this.selectedfile) {
      formdata.append('profileurl', this.selectedfile);
    } else {
      console.log('No file selected for profileurl details.');
    }


    if (this.ikkamaurl) {
      formdata.append('ikkamaurl', this.ikkamaurl);
    } else {
      console.log('No file selected for ikkamaurl details.');
    }


    if (this.selectedFilepassport) {
      formdata.append('passporturl', this.selectedFilepassport);
    } else {
      console.log('No file selected for passporturl details.');
    }


    if (this.selectedFilebaladyurl) {
      formdata.append('baladyurl', this.selectedFilebaladyurl);
    } else {
      console.log('No file selected for baladyurl details.');
    }


    if (this.selectedFilecontract) {
      formdata.append('contractdetailsurl', this.selectedFilecontract);
    } else {
      console.log('No file selected for contract details.');
    }


    formdata.append('type', this.EmployeeForm.controls['Type'].value);

    formdata.append('ikkamaId', this.EmployeeForm.controls['kotkotid'].value);
    formdata.append('otherIdNo', this.EmployeeForm.controls['validid'].value);
    formdata.append('otherIdExpiry', this.EmployeeForm.controls['DIssueExp'].value);
    // console.log(JSON.stringify(this.familyDetailsArray));

    // Transform family details array for backend
    // const familyDetailsForBackend = this.familyDetailsArray.map(member => ({
    //   name: member.name,
    //   dob: member.dob,
    //   relation: member.relation,
    //   adharno: member.adharno
    // }));

    // formdata.append('familydetails', JSON.stringify(familyDetailsForBackend));


    // Handle PF Checkbox]

    const isPfChecked = this.EmployeeForm.get('PFCheckbox')?.value;
    if (isPfChecked) {
      const pfPercentageValue = this.EmployeeForm.get('PFpercentage')?.value;
      formdata.append('ispf', 'Yes'); // Send 'yes' when checkbox is checked
      formdata.append('pfamount', pfPercentageValue);
    } else {
      formdata.append('ispf', 'No'); // Send 'no' when checkbox is unchecked
    }

    // Handle ESI Checkbox

    const isEsiChecked = this.EmployeeForm.get('ESICheckbox')?.value;
    if (isEsiChecked) {
      const esiPercentageValue = this.EmployeeForm.get('ESIpercentage')?.value;
      formdata.append('isesi', 'Yes');
      formdata.append('esi', esiPercentageValue);
    } else {
      formdata.append('isesi', 'No');
    }


    formdata.append('basicsalary', this.EmployeeForm.controls['BasicSalary'].value || '');
    formdata.append('da', this.EmployeeForm.controls['DA'].value || '');
    formdata.append('hra', this.EmployeeForm.controls['HRA'].value || '');
    formdata.append('ta', this.EmployeeForm.controls['TA'].value || '');

    formdata.append('monthlyworkingdays', this.EmployeeForm.controls['monthlyworkingdays'].value || '');


    formdata.append('bankname', this.EmployeeForm.controls['BankName'].value || '');
    formdata.append('accountnumber', this.EmployeeForm.controls['AccNumber'].value || '');
    formdata.append('ifsccode', this.EmployeeForm.controls['IFSCcode'].value || '');
    formdata.append('branch', this.EmployeeForm.controls['Branch'].value || '');

    formdata.append('joiningdate', this.EmployeeForm.controls['JoiningDate'].value || '');
    formdata.append('basicworkinghours', '0');
    formdata.append('breakhours', '0');

    formdata.append('resigneddate', 'null');


    formdata.append('username', this.EmployeeForm.controls['username'].value);
    formdata.append('password', this.EmployeeForm.controls['password'].value);

    //  Append salaryDate
    const salaryDateValue = this.EmployeeForm.get('salaryDate')?.value;
    formdata.append('salarydate', salaryDateValue);

    // Validate and append salary date
    // if (salaryDateValue === '5' || salaryDateValue === '10') {
    //   formdata.append('salarydate', salaryDateValue);
    // } else {
    //   this.toastrService.showError('Invalid salary date selected.');
    //   return;
    // }
    formdata.append('createdId', this.adminId);
    formdata.append('language', this.storedLang);
    formdata.append('empid', this.adminId);



    const apiUrl = this.isEditMode
      ? environment.apiUrl + 'codspropay/api/editemployee/'
      : environment.apiUrl + 'codspropay/api/addemployee/';

    this.Loader = true;
     this.apiService.postData(apiUrl, formdata).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] == 'Success') {
          this.toastrService.showSuccess(response.message)
          this.router.navigateByUrl('/superadmin/employeelist')
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

  showDeleteDialog(item: any) {
    this.deleteCountryModal = true;
    this.Delete_item = item;
  }




  // Add a new family member to the array
  // addFamilyMember() {
  //   if (this.FamilyMembers.valid) {
  //     const familyMember = this.FamilyMembers.value;

  //     familyMember.id = this.familyDetailsArray.length ? this.familyDetailsArray[this.familyDetailsArray.length - 1].id + 1 : 1;

  //     familyMember.slNo = this.familyDetailsArray.length + 1;

  //     // Push the form values into the array
  //     this.familyDetailsArray.push(familyMember);
  //     this.arrList = [...this.familyDetailsArray];

  //     this.FamilyMembers.reset();

  //     console.log(this.familyDetailsArray);

  //     const familyDetailsForBackend = this.familyDetailsArray.map(member => ({
  //       name: member.name,
  //       dob: member.dob, 
  //       relation: member.relation,
  //       adharno: member.adharno
  //     }));

  //     console.log(familyDetailsForBackend);



  //   } else {
  //     console.log('Form is invalid');

  //     const Toast = Swal.mixin({
  //       toast: true,
  //       position: 'top-end',
  //       showConfirmButton: false,
  //       timer: 3000,
  //       timerProgressBar: true,
  //       didOpen: (toast) => {
  //         toast.addEventListener('mouseenter', Swal.stopTimer);
  //         toast.addEventListener('mouseleave', Swal.resumeTimer);
  //       }
  //     });

  //     Toast.fire({
  //       icon: 'error',
  //       title: 'Please fill all family details.'
  //     });
  //   }
  // }

  // Helper function to format the date as "dd-mm-yyyy"
  // formatDate(dateString: string): string {
  //   const date = new Date(dateString);
  //   const day = ('0' + date.getDate()).slice(-2);
  //   const month = ('0' + (date.getMonth() + 1)).slice(-2);
  //   const year = date.getFullYear();
  //   return `${day}-${month}-${year}`;
  // }

  // Function to open the edit modal 

  // openEditModal(familyMember: any) {
  //   this.EditFamilyDetailsForm.patchValue({
  //     name: familyMember.name,
  //     dob: familyMember.dob,
  //     relation: familyMember.relation,
  //     adharno: familyMember.adharno
  //   });
  //   this.selectedFamilyMemberId = familyMember.id;
  //   this.EditModal = true;
  // }


  // editFamilyDetailsFn() {
  //   if (this.EditFamilyDetailsForm.valid) {
  //     const updatedFamilyMember = this.EditFamilyDetailsForm.value;
  //     updatedFamilyMember.id = this.selectedFamilyMemberId;

  //     const index = this.familyDetailsArray.findIndex(member => member.id === this.selectedFamilyMemberId);

  //     if (index !== -1) {
  //       updatedFamilyMember.slNo = this.familyDetailsArray[index].slNo;

  //       this.familyDetailsArray[index] = updatedFamilyMember;
  //       this.arrList = [...this.familyDetailsArray];

  //       this.EditModal = false;

  //       console.log(this.familyDetailsArray);
  //     } else {
  //       console.log('Family member not found:', this.selectedFamilyMemberId);
  //     }
  //   } else {
  //     console.log('Form is invalid');

  //     const Toast = Swal.mixin({
  //       toast: true,
  //       position: 'top-end',
  //       showConfirmButton: false,
  //       timer: 3000,
  //       timerProgressBar: true,
  //       didOpen: (toast) => {
  //         toast.addEventListener('mouseenter', Swal.stopTimer);
  //         toast.addEventListener('mouseleave', Swal.resumeTimer);
  //       }
  //     });

  //     Toast.fire({
  //       icon: 'error',
  //       title: 'Please fill all family details correctly.'
  //     });
  //   }
  // }


  // confirmDelete() {
  //   this.deleteFamilyMember(this.Delete_item);
  //   this.deleteCountryModal = false;
  // }

  // deleteFamilyMember(element: any) {
  //   console.log('Element to delete:', element.id);

  //   const index = this.familyDetailsArray.findIndex(member => member.id === element.id);

  //   console.log('Array before delete:', this.familyDetailsArray);

  //   if (index !== -1) {
  //     this.familyDetailsArray.splice(index, 1);

  //     this.familyDetailsArray.forEach((member, index) => member.slNo = index + 1);

  //     this.arrList = [...this.familyDetailsArray];
  //     console.log('Deleted:', element);
  //   } else {
  //     console.log('Element not found:', element);
  //   }

  //   console.log('Array after delete:', this.familyDetailsArray);
  // }




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

  onCheckboxChange(event: any) {
    this.showFields = event.target.checked;
  }


  showModalDialog() {
    this.EditModal = true;
  }


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  // eventFromTable(objEvent: any) {
  //   switch (objEvent.strOperation) {
  //     case 'EDIT_DATA':
  //       this.showModalDialog();
  //       console.log(objEvent.objElement.id);
  //       this.openEditModal(objEvent.objElement);
  //       break;

  //     case 'DELETE_DATA':
  //       this.showDeleteDialog(objEvent.objElement);
  //       console.log(objEvent.objElement);
  //       break;

  //     default:
  //       break;
  //   }
  // }


}
