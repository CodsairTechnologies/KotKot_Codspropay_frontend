import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { TableComponent } from '../../commoncomponents/table/table.component';
import { DialogModule } from 'primeng/dialog';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

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
  blnForDelete: boolean = false;
  blnNoEdit: boolean = false;


  addCompanyForm!: FormGroup;
  editCompanyForm!: FormGroup;

  token: any;
  adminid: any;
  userName: any;
  incentiveid: any;
  Loader: boolean = false;

  CompanyId: any;
  Companylist: any = [];

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.incentiveid = sessionStorage.getItem("incentiveid");

    this.getCompanyTableFn(this.incentiveid)
  }

arrColumns: any = [
  { strHeader: "SlNo", strAlign: "center", strKey: "slNo" },
  { strHeader: "Month", strAlign: "center", strKey: "month" },
  { strHeader: "Employee", strAlign: "center", strKey: "name" },
  { strHeader: "Bonus", strAlign: "center", strKey: "bonus" },
  { strHeader: "Cutting", strAlign: "center", strKey: "cutting" },
];

arrList: any = [];

getCompanyTableFn(incentiveid: any) {
  const reqHeader = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token
  });

  this.Loader = true;
  this.http.post(environment.apiUrl + 'codspropay/api/viewincentivebyid/', 
    { incentiveid }, { headers: reqHeader }
  ).subscribe({
    next: (response: any) => {
      this.Loader = false;

      if (response.response === 'Success') {
        this.arrList = response.incentive.map((obj: any, index: number) => ({
          slNo: index + 1,
          month: `${obj.month || ''} ${obj.year || ''}`.trim(),
          name: `${obj.name || ''} (${obj.employeeid || ''})`.trim(),
          bonus: obj.bonus,
          cutting: obj.cutting
        }));
      } else {
        this.showMessage(response);
      }
    },
    error: (error) => this.handleError(error)
  });
}

private showMessage(response: any) {
  if (response.response === 'Error') this.toastrService.showError(response.message);
  else this.toastrService.showWarning(response.message);
}

private handleError(error: any) {
  this.Loader = false;
  if (error.status === 401) {
    this.toastrService.showError('Invalid token. Please log in again.');
    setTimeout(() => this.router.navigateByUrl('login'), 1500);
  } else {
    this.toastrService.showError('Unable to process your request at the moment. Please try again later.');
  }
}


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

}
