import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Tooltip } from 'bootstrap';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule, CommonModule, PaginatorModule, FormsModule, DropdownModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Output() objPresentationEvent = new EventEmitter()
  @Input() arrList = []
  @Input() arrColumns: any[] = [];
  @Input() blnHasActions: boolean = false;
  @Input() blnNoEdit: boolean = false;
  @Input() blnHasSingleview: boolean = false;
  @Input() blnHasDown: boolean = false;
  @Input() blnForDelete: boolean = false;
  @Input() blnHasProfile: boolean = false;
  @Input() hideEditIconForInactive: boolean = false;
  @Input() hideDeleteIconForActive: boolean = false;





  @Input() showDownloadButton: boolean = false;

  apiurl: any = environment.apiUrl;

  first = 0;
  rows = 15;

  tableType: any;

  totalRecords!: number;

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.arrList);
    console.log(this.arrColumns);
    console.log(this.blnHasActions);

  }

  ngOnInit(): void {

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl);
    });
  }

  openImage(imageUrl: string) {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  downloadASPDF(fileUrl: string): void {
    const completeUrl = `${this.apiurl}/${fileUrl}`; // Ensure apiurl is correctly set

    // Open the PDF in a new tab
    window.open(completeUrl, '_blank');

    // Create a hidden anchor element to trigger download
    const link = document.createElement('a');
    link.href = completeUrl;
    link.target = '_blank';
    link.download = fileUrl.split('/').pop() || 'invoice.pdf'; // Extract filename from URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
  }



  onrequestStatusChange(objRowData: any, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    console.log(`Status changed for ${objRowData.id}:`, newStatus);

    this.objPresentationEvent.emit({
      strOperation: 'REQUESTSTATUS_CHANGE',
      objElement: {
        invoiceid: objRowData.invoiceid,
        quotationid: objRowData.quotationid,
        id: objRowData.id,
        status: newStatus,
        type: objRowData.type
      }
    });

  }

  downloadPDF(fileUrl: string): void {
    const completeUrl = `${this.apiurl}/${fileUrl}`; // Ensure `apiurl` is correctly set in your environment
    window.open(completeUrl, '_blank'); // Opens in a new tab
  }


  getColumnStyles(col: any, strType: any): { [key: string]: string } {
    return {
      'width': col.strWidth,
      'text-align': col.strAlign,
      'border-right': strType === 'td' ? col.strKey !== 'strActions' ? '1px solid rgb(216, 216, 216)' : 'none' : 'none',
      'padding': ' 0.5rem'
    };
  }

  editTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'EDIT_DATA',
      objElement: objRowData
    })
  }

  dltTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'DELETE_DATA',
      objElement: objRowData
    })
  }

  singleviewTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'SINGLEVIEW_DATA',
      objElement: objRowData
    })
  }


  profileTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'PROFILE_DATA',
      objElement: objRowData
    })
  }




  toggleTableData(objRowData: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const checked = inputElement.checked;

    const updatedRowData = { ...objRowData, toggle: checked };

    this.objPresentationEvent.emit({
      strOperation: 'TOGGLETABLE_DATA',
      objElement: updatedRowData
    });
  }

}
