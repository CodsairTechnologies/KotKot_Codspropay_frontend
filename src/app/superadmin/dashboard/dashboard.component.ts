interface Event {
  id: number;
  date: string;
  event: string;
  createddate?: string;
}

interface ExpiryData {
  model: string;
  regno: string;
  Tax: string;
  Insurance: string;
  Pollution: string;
  expiry_count: number;
}

interface EmpExpiryData {
  "Employee Name": string;
  "Passport Expiry": string;
  "Visa Expiry": string;
  "Other ID Expiry": string;
  "Driving License Expiry": string;
}




import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, DayCellContentArg, EventInput } from '@fullcalendar/core';
import { ChartData } from 'chart.js';
import Swal from 'sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular'; 

import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule, ReactiveFormsModule, DialogModule,
    CommonModule,
    FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  calendarOptions: CalendarOptions;

  lineStylesData: any;
  basicOptions: any;


  token: any;
  adminid: any;
  userName: any;
  status: any;
  addedby: any;
  Loader: boolean = false;

  todoid: any;
  selectedTodo: any = null;

  todoForm!: FormGroup;
  edittodoForm!: FormGroup;
  eventForm!: FormGroup;
  editeventForm!: FormGroup;

  toDoList: any = [];
  todobyID: any = [];
  expiryList: any = [];
  countsArray: any = [];
  eventList: Event[] = [];
  selectedTodoId: any;
  EventbyIDList: any = [];
  LoanList: any = [];

  isReadonly: boolean = true;
  showUpdateButton: boolean = false;


  displayDialog: boolean = false;
  selectedDate: string = '';
  // calendarOptions: CalendarOptions;
  Eventid: any;
  Eventdateid: any;
  datewiseEventList: any = [];

  displayEventDialog: boolean = false;
  displayEventListDialog: boolean = false
  eventDetail: any = [];
  isEditing: boolean = false;

  apiUrl: any = environment.apiUrl;

  EmployeeexpiryList: any = [];

  private hasShownWarning: boolean = false;

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router, private toastrService: ToastService, private errorHandingservice: ErrorHandlingService) {

    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: []
    };



  }



  ngOnInit(): void {


    this.token = sessionStorage.getItem("token");
    this.adminid = sessionStorage.getItem("adminId");
    this.userName = sessionStorage.getItem("username");
    this.status = sessionStorage.getItem("status");
    this.addedby = sessionStorage.getItem("adminId");



    this.todoForm = this.formbuilder.group({
      newTodo: ['', Validators.required]
    });

    this.edittodoForm = this.formbuilder.group({
      newTodo: ['', Validators.required]
    });

    this.eventForm = this.formbuilder.group({
      title: ['', Validators.required],
    });

    this.editeventForm = this.formbuilder.group({
      title: [{ value: '', disabled: true }, Validators.required]
    });

    // this.getInvoiceFn();
    // this.getToDoFn();
    // this.getCountsFn();
    // this.getvehicleexpiryFn();
    // this.getEventFn();
    // this.getLoanTableFn();
    // this.getstaffexpiryFn();

    this.lineStylesData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          // tension: .4,
          borderColor: '#910D0D'
        },
        {
          label: 'Second Dataset',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderDash: [5, 5],
          // tension: .4,
          borderColor: '#97E9EE'
        },
        {
          label: 'Third Dataset',
          data: [12, 51, 62, 33, 21, 62, 45],
          fill: false,
          borderColor: '#97E9EE',
          // tension: .4,
          backgroundColor: 'rgba(255,167,38,0.2)'
        }
      ]
    };
  }
  getFormattedDate(datetime: string): string {
    return new Date(datetime).toISOString().split('T')[0]; // Extracts only the date
  }



  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'on process':
        return 'status-process';
      case 'closed':
        return 'status-closed';
      case 'payment received':
        return 'status-received';
      default:
        return '';
    }
  }


  invoices: any = [];

  openInvoice(fileUrl: string): void {
    const completeUrl = `${this.apiUrl}/${fileUrl}`;

    // Open the PDF in a new tab
    window.open(completeUrl, '_blank');

    // Create a hidden anchor element to trigger download
    const link = document.createElement('a');
    link.href = completeUrl;
    link.target = '_blank';
    link.download = fileUrl.split('/').pop() || 'invoice.pdf'; // Extract filename from URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  customDayCellContent(arg: DayCellContentArg) {
    arg.dayNumberText = arg.dayNumberText.replace('<', '');

    return { html: '<div class="custom-cell">' + arg.dayNumberText + '</div>' };
  }


  todos: { text: string; completed: boolean; expanded: boolean }[] = [];
  isFormVisible = false;
  newTodoText = '';

  toggleForm(): void {
    this.isFormVisible = !this.isFormVisible;
  }

  getBackgroundColorClass(value: string): string {
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const isDays = /^\d+\s+days?$/.test(value);

    if (value === 'Expired') {
      return 'bg-red'; // Class for expired values
    } else if (isDate) {
      return 'bg-yellow'; // Class for date values
    } else if (isDays) {
      return 'bg-green'; // Class for days values
    } else {
      return 'bg-white'; // Default class
    }
  }



  getCountsFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/countfordashboard/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {

          // Structure countsArray as an array of objects
          this.countsArray = [
            { employeecount: response.employeecount[0], unitcount: response.unitcount[0] }
          ];

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

  getvehicleexpiryFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/getexpiryfields/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.expiryList = response.expiry_data as ExpiryData[];
          this.checkAndDisplayWarning(this.expiryList);
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

  getstaffexpiryFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/employeeexpiryfields/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.EmployeeexpiryList = response.expiry_data as EmpExpiryData[];
          this.checkAndDisplayStaffWarning(this.EmployeeexpiryList);
          console.log("Staff expiry check triggered", this.EmployeeexpiryList);

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


  // Function to check and display staff document expiry warnings
  checkAndDisplayStaffWarning(expiryList: EmpExpiryData[]) {
    console.log("Staff expiry check triggered", expiryList);

    let reminders = '';

    expiryList.forEach((expiry: EmpExpiryData) => {
      const empName = `<b>${expiry["Employee Name"]}</b>`;
      const passportReminder = this.getReminderMessage(expiry["Passport Expiry"], 'Passport', empName);
      const visaReminder = this.getReminderMessage(expiry["Visa Expiry"], 'Visa', empName);
      const licenseReminder = this.getReminderMessage(expiry["Driving License Expiry"], 'Driving License', empName);
      const otherIDReminder = this.getReminderMessage(expiry["Other ID Expiry"], 'Other ID', empName);

      if (passportReminder) reminders += `• ${passportReminder}<br>`;
      if (visaReminder) reminders += `• ${visaReminder}<br>`;
      if (licenseReminder) reminders += `• ${licenseReminder}<br>`;
      if (otherIDReminder) reminders += `• ${otherIDReminder}<br>`;
    });

    console.log("Final staff reminders:", reminders);

    if (reminders.trim() !== '') {
      reminders += '<br>Please renew soon.';
      this.showWarningMessage('Upcoming Staff Document Expirations', reminders);
    }
  }


  // Function to check and display vehicle expiry warnings
  checkAndDisplayWarning(expiryList: ExpiryData[]) {
    let reminders = '';

    expiryList.forEach((expiry: ExpiryData) => {
      const boldRegNo = `<b>${expiry.regno}</b>`;
      const taxReminder = this.getReminderMessage(expiry.Tax, 'Tax', boldRegNo);
      const insuranceReminder = this.getReminderMessage(expiry.Insurance, 'Insurance', boldRegNo);
      const pollutionReminder = this.getReminderMessage(expiry.Pollution, 'Pollution', boldRegNo);

      console.log(`Checking expiry for ${expiry.regno}`);
      console.log(`Tax: ${taxReminder}, Insurance: ${insuranceReminder}, Pollution: ${pollutionReminder}`);

      if (taxReminder) reminders += `• ${taxReminder}<br>`;
      if (insuranceReminder) reminders += `• ${insuranceReminder}<br>`;
      if (pollutionReminder) reminders += `• ${pollutionReminder}<br>`;
    });

    console.log("Final vehicle reminders:", reminders);

    if (reminders.trim() !== '') {
      reminders += '<br>Please renew soon.';
      this.showWarningMessage('Upcoming Vehicle Expirations', reminders)
        .then(() => {
          console.log("Vehicle warning displayed. Now showing staff expiry warnings.");
          this.checkAndDisplayStaffWarning(this.EmployeeexpiryList);
        });
    } else {
      console.log("No vehicle warnings found. Showing staff expiry warnings directly.");
      this.checkAndDisplayStaffWarning(this.EmployeeexpiryList);
    }
  }
  // Function to show warning messages
  showWarningMessage(title: string, reminders: string) {
    console.log(`Showing warning message: ${title}`); // Debug log

    return Swal.fire({
      icon: 'warning',
      title: title,
      html: `<div style="max-height: 150px; overflow-y: auto;">${reminders}</div>`,
      showConfirmButton: true,
      width: '600px',
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


  // Function to generate reminder messages only for "X days" format
  getReminderMessage(value: string, type: string, identifier: string): string | null {
    const isDays = /^\d+\s+days?$/.test(value); // Matches "4 days", "10 days", etc.

    if (isDays) {
      return `${identifier}'s ${type} will expire in ${value}.`;
    }
    return null; // Ignore other formats like dates or "No Date"
  }






  addTodo() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    var formdata = new FormData();
    formdata.append('todo', this.todoForm.controls['newTodo'].value);
    formdata.append('addedby', this.addedby);


    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/addtodo/', formdata, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.getToDoFn();
          this.todoForm.reset();
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


  getToDoFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/gettodo/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.toDoList = response.todo_list;
        }
        else {
          // this.handleErrorResponse(response); 
        }
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }



  /* get to do by id */



  getInvoiceFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/invoicefordashboard/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.invoices = response.invoices;
        }
        else {
          // this.handleErrorResponse(response); 
        }
      },
      (error) => {
        this.Loader = false;
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader });
      })
  }

  getToDoById(id: any) {
    this.todoid = id.toString();
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/viewtodobyid/', { todo_id: this.todoid }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {

        this.todobyID = response['todo_list'];

        if (this.todobyID.length > 0) {
          const Todo = this.todobyID[0];
          this.edittodoForm.controls['newTodo'].setValue(Todo.todo);
        }
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

  /* end get to do by id */



  /* Edit toDo */

  enableEdit() {
    this.isReadonly = false;
    this.showUpdateButton = true;
  }

  editTodoFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.edittodoForm.invalid) {
      return;
    }

    var formdata = new FormData();
    formdata.append('todo', this.edittodoForm.controls['newTodo'].value);
    formdata.append('todo_id', this.todoid);
    this.Loader = true;

    this.http.post(environment.apiUrl + '/api/edittodo/', formdata, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] === 'Success') {

        this.toastrService.showSuccess(response.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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

  /* End Edit toDo */



  openDeleteModal(itemId: number) {
    this.selectedTodoId = itemId;
  }

  /* Method to delete the todo item */

  dltTodoFn() {
    if (this.selectedTodoId === null) {
      return; // No ID selected
    }

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/deletetodo/', { todo_id: this.selectedTodoId }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.getToDoFn();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          this.selectedTodoId = null;
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
  /* End Method to delete the todo item */



  toggleCheckbox(index: number) {
    this.toDoList[index].isChecked = !this.toDoList[index].isChecked;
  }




  /* event calenter */

  // add event

  addEvents() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    var formdata = new FormData();
    formdata.append('event', this.eventForm.controls['title'].value);
    formdata.append('eventid', '');
    formdata.append('date', this.selectedDate);


    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/addevent/', formdata, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.getEventFn();
          this.closeDialog();
          this.displayEventListDialog = false;
          // setTimeout(() => {
          //   window.location.reload();
          // }, 1000);

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

  // get event

  getEventFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/viewevents/', { id: 'sample' }, { headers: reqHeader }).subscribe(
      (response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.eventList = response.events;
          this.updateCalendarEvents();
        }
        else {
          // this.handleErrorResponse(response); 
        }
      },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }



  // Function to start editing the event
  editEvent() {
    this.isEditing = true;
    this.editeventForm.get('title')?.enable();
  }

  // Function to save the edited event
  saveEvent() {
    if (this.editeventForm.invalid) {
      this.toastrService.showError("Event title cannot be empty.");
      return;
    }

    const title = this.editeventForm.get('title')?.value;

    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const formdata = new FormData();
    formdata.append('event', title);
    formdata.append('eventid', this.eventDetail.id.toString());

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/editevent/', formdata, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.isEditing = false;

          this.editeventForm.get('title')?.disable();
          this.getEventFn();
          setTimeout(() => {
            window.location.reload();
          }, 500);
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

  // Function to delete the event
  deleteEvent() {
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;

    this.http.post(environment.apiUrl + '/api/deleteevent/', { eventid: this.eventDetail.id }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;

        if (response['response'] === 'Success') {
          this.toastrService.showSuccess(response.message);
          this.closeEventDialog();
          setTimeout(() => {
            window.location.reload();
          }, 1000);

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

  // Function to close the event details dialog
  closeEventDialog() {
    this.displayEventDialog = false;
    this.editeventForm.reset(); // Reset the form when closing the dialog
  }


  updateCalendarEvents() {
    const events: EventInput[] = this.eventList.map((event: Event) => ({
      id: event.id.toString(), // Ensure id is a string
      title: event.event,
      date: event.date,
      backgroundColor: this.getRandomColor()
    }));

    this.calendarOptions.events = events;
  }

  getRandomColor(): string {
    const colors = [
      '#ff9f00', // Orange
      '#ff3f00', // Red
      '#f5a623', // Light Orange
      '#007bff', // Blue
      '#0056b3', // Dark Blue
      '#6610f2', // Purple
      '#e83e8c', // Pink
      '#28a745', // Green
      '#dc3545', // Red
      '#ffc107', // Amber
      '#6f42c1', // Indigo
      '#20c997'  // Emerald
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }


  handleDateClick(arg: any) {
    this.selectedDate = arg.dateStr;
    this.getEventByDate(arg.dateStr);
  }


  handleEventClick(arg: any) {
    const eventId = arg.event.id;
    this.getEventById(eventId);
    this.displayEventDialog = true;
  }





  openEventDetails(eventId: any) {
    this.getEventById(eventId);
  }

  getEventById(id: any) {
    this.Eventid = id.toString();
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/geteventbyid/', { eventid: this.Eventid }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.eventDetail = response['event'][0];

          // Update the form with event details
          this.editeventForm.patchValue({
            title: this.eventDetail.event
          });
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

  getEventByDate(date: any) {
    this.Eventdateid = date.toString();
    const reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/eventbydate/', { date: this.Eventdateid }, { headers: reqHeader })
      .subscribe((response: any) => {
        this.Loader = false;
        if (response['response'] === 'Success') {
          this.datewiseEventList = response['event'];
          if (this.datewiseEventList.length > 0) {
            // If there are events, show the events dialog
            this.displayEventListDialog = true;
            this.displayDialog = false;
          } else {
            // If there are no events, show the add event dialog
            this.selectedDate = this.Eventdateid;
            this.displayDialog = true;
            this.displayEventListDialog = true;
          }
        } else if (response['response'] === 'Warning') {
          this.toastrService.showWarning(response.message);
          this.selectedDate = this.Eventdateid;
          this.displayDialog = true;
        } else {
          this.Loader = false;
          this.toastrService.showError(response.message);
        }
      },

        (error) => {
          this.Loader = false; // Hide loader on error
           this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
        })
  }

  // Open the "Add Event" dialog
  openAddEventDialog() {
    this.displayDialog = true;
  }

  // Close the event list dialog
  closeEventListDialog() {
    this.displayEventListDialog = false;
  }

  // Close the add event dialog
  closeDialog() {
    this.displayDialog = false;
  }

  onModalHidden() {
    this.reloadCurrentPage();
  }

  /**get loan table data */
  getLoanTableFn() {
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    this.Loader = true;
    this.http.post(environment.apiUrl + '/api/loanfordashboard/', { id: 'sample' }, { headers: reqHeader }).subscribe((response: any) => {
      this.Loader = false;

      if (response['response'] == 'Success') {
        this.LoanList = response.loans
        console.log(this.LoanList);
      }

      else {
        // this.handleErrorResponse(response); 
      }
    },
      (error) => {
        this.Loader = false; // Hide loader on error
         this.errorHandingservice.handleErrorResponse(error, { value: this.Loader }); // Handle HTTP errors
      })
  }
  /**get loan table data */



  tableRows: { isChecked: boolean; text: string; hasChevron: boolean }[] = [
    {
      isChecked: false,
      text: 'consectetur adipiscing elite, sed do eiusmod tempor...',
      hasChevron: true
    },
    {
      isChecked: false,
      text: 'consectetur adipiscing elite, sed do eiusmod tempor...',
      hasChevron: true
    },
    {
      isChecked: false,
      text: 'consectetur adipiscing elite, sed do eiusmod tempor...',
      hasChevron: true
    }
  ];





  dataArray = [
    {
      heading: "Lorem",
      para1: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, in pariatur magni voluptatem sed dolor dolorem, omnis neque praesentium aut incidunt quisquam ratione vero iusto assumenda aliquam ad quia ab!",
      para2: "adipiscing elit, sed do"
    },
    {
      heading: "Lorem",
      para1: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, in pariatur magni voluptatem sed dolor dolorem, omnis neque praesentium aut incidunt quisquam ratione vero iusto assumenda aliquam ad quia ab!",
      para2: "adipiscing elit, sed do"
    },
    {
      heading: "Lorem",
      para1: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, in pariatur magni voluptatem sed dolor dolorem, omnis neque praesentium aut incidunt quisquam ratione vero iusto assumenda aliquam ad quia ab!",
      para2: "adipiscing elit, sed do"
    },
    {
      heading: "Lorem",
      para1: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis, in pariatur magni voluptatem sed dolor dolorem, omnis neque praesentium aut incidunt quisquam ratione vero iusto assumenda aliquam ad quia ab!",
      para2: "adipiscing elit, sed do"
    },

  ];



  tableData = [
    { id: 1, first: 'Lorem ipsum', last: '/assets/images/Ellipse 88.png', handle: 'consectetur' },
    { id: 2, first: 'Lorem ipsum', last: '/assets/images/Ellipse 88.png', handle: 'consectetur' },
    { id: 3, first: 'Lorem ipsum', last: ' /assets/images/Ellipse 88.png', handle: 'consectetur' },
    { id: 4, first: 'Lorem ipsum', last: ' /assets/images/Ellipse 88.png', handle: 'consectetur' },

  ];



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


  reloadCurrentPage() {
    window.location.reload();
  }


}
