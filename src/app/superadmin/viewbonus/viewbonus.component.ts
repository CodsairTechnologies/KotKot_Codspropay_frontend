import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-viewbonus',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TableComponent, DialogModule, RouterModule],
  templateUrl: './viewbonus.component.html',
  styleUrl: './viewbonus.component.css'
})
export class ViewbonusComponent {

  deleteModal: boolean | undefined;
  EditModal: boolean | undefined;
  blnHasSingleview: boolean = false;
  blnForDelete: boolean = true;
  blnNoEdit: boolean = true;


  addCompanyForm!: FormGroup;
  editCompanyForm!: FormGroup;

  token: any;
  adminid: any;
  userName: any;
  incentiveid: any;
  Loader: boolean = false;

  CompanyId: any;
  Companylist: any = [];

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.incentiveid = sessionStorage.getItem("incentiveid");

    this.getCompanyTableFn(this.incentiveid)
  }

  arrColumns: any = [
    { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
    { strHeader: "Company", strAlign: "center", strKey: "unitname" },
    { strHeader: "Actions", strAlign: "center", strKey: "strActions" },

  ]

  arrList: any = []




  /**get Company table */
  getCompanyTableFn(incentiveid: any) {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + 'codspropay/api/viewincentivebyid/', { incentiveid: incentiveid }, { headers: reqHeader })
      .subscribe(
        (response: any) => {
          if (response['response'] === 'Success') {
            response.unitlist.forEach((obj: { [x: string]: any; }, index: number) => {
              obj['slNo'] = index + 1;
            });
            this.arrList = response.unitlist;
            console.log(this.arrList);
            this.Loader = false;

          } else if (response['response'] === 'Error') {
            this.showError(response.message);
            setTimeout(() => {
              this.Loader = false;
            }, 12000);

          } else {
            this.showWarning(response.message);
            this.Loader = false;
          }
        },
        (error) => {
          this.Loader = false;

          if (error.status === 401) {
            // Unauthorized error (invalid token)
            this.showError('Invalid token. Please log in again.');
            setTimeout(() => {
              this.Loader = false;
              this.router.navigateByUrl('login');
            }, 1500);

          } else {
            // Other server errors
            this.showError('Unable to process your request at the moment. Please try again later.');
            setTimeout(() => {
              this.Loader = false;
            }, 12000);
          }
        }
      );
  }
  /**get Company table */



  showDeleteDialog() {
    this.deleteModal = true
  }
  showModalDialog() {
    this.EditModal = true;
  }


  eventFromTable(objEvent: any) {
    switch (objEvent.strOperation) {
      case 'DELETE_DATA':
        this.showDeleteDialog()
        console.log(objEvent.objElement)
        this.CompanyId = objEvent.objElement.id;
        break;

      default:
        break;
    }
  }


  onModalHidden() {
    this.reloadCurrentPage();
  }

  reloadCurrentPage() {
    window.location.reload();
  }


  showSuccess(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'success',
      title: message
    });
  }

  showError(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'error',
      title: message
    });
  }

  showWarning(message: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: 'warning',
      title: message
    });
  }
}
