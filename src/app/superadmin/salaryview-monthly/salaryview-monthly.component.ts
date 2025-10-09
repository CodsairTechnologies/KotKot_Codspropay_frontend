import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-salaryview-monthly',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, TableComponent,
        CommonModule, NgSelectModule, PaginatorModule,
        FormsModule],
  templateUrl: './salaryview-monthly.component.html',
  styleUrl: './salaryview-monthly.component.css'
})
export class SalaryviewMonthlyComponent {
 first = 0;
  rows = 10;

  blnForDelete: boolean = true;
  blnHasSingleview: boolean = true;
  arrList: any = [
  ];

  

  Did: any;
  Dmonth: any;
  Dyear: any;

  token: any;
  adminid: any;
  userName: any;
  status: any;
  Loader: boolean = false;

deleteModal: boolean = false;
editModal: boolean = false;

  Vid: any;

  constructor(private router: Router, private formbuilder: FormBuilder, private http: HttpClient, 
    private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");
    this.getSalaryTableFn()
  }


  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Year", strAlign: "center", strKey: "year" },
    { strHeader: "Month", strAlign: "center", strKey: "month" },
    // { strHeader: "Status", strAlign: "center", strKey: "strStatus" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]

  /**get Salary table data */
  getSalaryTableFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/givensalarylist/', { id: 'sample' }, { headers: reqHeader }).subscribe((response: any) => {
      if (response['response'] == 'Success') {
        response.given_salarylist.map((obj: { [x: string]: any; }, index: number) => {
          obj['slNo'] = index + 1
        })
        this.Loader = false;

        this.arrList = response.given_salarylist
        console.log(this.arrList);
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
  /**get Salary table data */


  deleteSalaryFn(month: number, year: number) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
  
    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/deletesalary/', { month: month, year: year }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);

          setTimeout(() => {
            this.reloadCurrentPage();
            this.getSalaryTableFn(); 
          }, 1000);
        } else {
          this.handleErrorResponse(response); // Handle non-success responses
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }
  
  dltSalary() {
    this.deleteSalaryFn(this.Dmonth, this.Dyear); 
    this.deleteModal = false; 
  }
  



  singleviewsalary(month: string, year: string) {
    this.router.navigateByUrl('superadmin/view-empsalary');

    sessionStorage.setItem("month", month);
    sessionStorage.setItem("year", year);
  }

  showDeleteDialog() {
    this.deleteModal = true
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


  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'DELETE_DATA':
        this.showDeleteDialog();
        const { month, year } = objEvent.objElement;
        console.log(`Deleting data for month: ${month}, year: ${year}`);
        this.Dmonth = month;  
        this.Dyear = year;    
        break;
  
      case 'SINGLEVIEW_DATA':
        const { month: viewMonth, year: viewYear } = objEvent.objElement;
        this.singleviewsalary(viewMonth, viewYear);
        console.log(objEvent.objElement);
        break;
  
      default:
        break;
    }
  }
  


  reloadCurrentPage() {
    window.location.reload();
  }

}
