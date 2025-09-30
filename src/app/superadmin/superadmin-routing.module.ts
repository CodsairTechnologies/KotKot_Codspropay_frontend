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


       // Attendance

      { path: 'attendance', component: AttendanceListComponent },
      { path: 'view-attendance', component: ViewAttendanceComponent },


       //  salary

      { path: 'emp-salary', component: EmpSalaryComponent },
      { path: 'view-empsalary', component: ViewEmpsalaryComponent },
      { path: 'view-monthlysalary', component: SalaryviewMonthlyComponent },

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperadminRoutingModule { }
