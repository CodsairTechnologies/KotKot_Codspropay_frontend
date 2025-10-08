import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { EmployeesSingleviewComponent } from './employees-singleview/employees-singleview.component';
import { EmployeesProfileComponent } from './employees-profile/employees-profile.component';
import { EmpSalaryComponent } from './emp-salary/emp-salary.component';
import { ViewEmpsalaryComponent } from './view-empsalary/view-empsalary.component';
import { SalaryviewMonthlyComponent } from './salaryview-monthly/salaryview-monthly.component';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { ViewAttendanceComponent } from './view-attendance/view-attendance.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';
import { AddoreditLoanComponent } from './addoredit-loan/addoredit-loan.component';
import { SingleviewLoanComponent } from './singleview-loan/singleview-loan.component';
import { SingleviewAdvancesalaryComponent } from './singleview-advancesalary/singleview-advancesalary.component';
import { AddoreditAdvancesalaryComponent } from './addoredit-advancesalary/addoredit-advancesalary.component';
import { ViewAdvancesalaryComponent } from './view-advancesalary/view-advancesalary.component';
import { BonusuploadComponent } from './bonusupload/bonusupload.component';
import { ViewbonusComponent } from './viewbonus/viewbonus.component';
import { OtPunchComponent } from './ot-punch/ot-punch.component';
import { EmployeePunchComponent } from './employee-punch/employee-punch.component';
import { WorkshiftEmployeeComponent } from './workshift-employee/workshift-employee.component';
import { ShiftListComponent } from './shift-list/shift-list.component';
import { AssignWorkshiftComponent } from './assign-workshift/assign-workshift.component';
import { EditWorkshiftComponent } from './edit-workshift/edit-workshift.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [

      // dashboard

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },


      // employees

      { path: 'addemployees', component: EmployeesComponent },
      { path: 'employeelist', component: EmployeesListComponent },
      { path: 'singleview-employee', component: EmployeesSingleviewComponent },
      { path: 'employee-profile', component: EmployeesProfileComponent },


      // Loan

      { path: 'loanview', component: ViewLoanComponent },
      { path: 'addeditloan', component: AddoreditLoanComponent },
      { path: 'singleview-loan', component: SingleviewLoanComponent },

      // Advance Salary

      { path: 'advancesalary', component: ViewAdvancesalaryComponent },
      { path: 'addeditadvancesalary', component: AddoreditAdvancesalaryComponent },
      { path: 'singleview-advancesalary', component: SingleviewAdvancesalaryComponent },


      // Attendance

      { path: 'attendance', component: AttendanceListComponent },
      { path: 'view-attendance', component: ViewAttendanceComponent },


      //  salary

      { path: 'emp-salary', component: EmpSalaryComponent },
      { path: 'view-empsalary', component: ViewEmpsalaryComponent },
      { path: 'view-monthlysalary', component: SalaryviewMonthlyComponent },

      // bonus

      { path: 'bonus', component: BonusuploadComponent },
      { path: 'viewbonus', component: ViewbonusComponent },

      // punch

      { path: 'ot-punch', component: OtPunchComponent },
      { path: 'employee-punch', component: EmployeePunchComponent },

      // Work Shift

      { path: 'workshift', component: WorkshiftEmployeeComponent },
      { path: 'assign-workshift', component: AssignWorkshiftComponent },
      { path: 'edit-workshift', component: EditWorkshiftComponent },

      { path: 'shiftlist', component: ShiftListComponent },



    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperadminRoutingModule { }
