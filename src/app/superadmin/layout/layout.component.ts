import { Component } from '@angular/core';
import { Router, RouterEvent, RouterModule } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [DialogModule,
      CommonModule,
      FormsModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {


  isSidebarToggled: boolean = false;
  isSubMenuOpen: boolean = false;


  isCollapsed: boolean[] = [];

  display: boolean = false;

  Loader: boolean = false;


  constructor(private router: Router, private toastrService: ToastService) {

  }
  ngOnInit(): void {
  }

  toggleCollapse(index: number) {
    this.isCollapsed[index] = !this.isCollapsed[index];
  }


  isSidebarClosed: boolean = false;


  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  showDialog() {
    this.display = true;
  }

  logout() {
    this.Loader = true;

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('adminId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('status');
    sessionStorage.removeItem('employeeId');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('hasShownWarning');


    setTimeout(() => {
      this.router.navigate(['/login']);

      this.toastrService.showSuccess('Logged Out Successfully');

      this.display = false;
      this.Loader = false;
    }, 2000);
  }

  onReject() {
    this.display = false;
  }

}
