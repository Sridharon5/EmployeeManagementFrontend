import { Component } from '@angular/core';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-designation',
  imports: [ButtonModule,CommonModule,FormsModule,DialogModule,TableModule],
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.scss',
})
export class DesignationComponent {
   designations: any[] = [];
   selectedDesignation: any = null;
   dialogVisible: boolean = false;
   dialogMode: 'view' | 'edit' | 'delete' | 'add' | '' = '';
 
   constructor(private api: ApiClient, private loader: NgxUiLoaderService) {}
 
   ngOnInit(): void {
     this.getAllDesignations();
   }
 
   getAllDesignations() {
     this.loader.start();
     this.api.get('designations/getAllDesignations').subscribe({
       next: (res: any) => {
         this.designations = res.data || res;
         this.loader.stop();
       },
       error: (err) => {
         console.error('Error fetching designations', err);
         this.loader.stop();
       },
     });
   }
 
   openDialog(desig: any, mode: 'view' | 'add' | 'edit' | 'delete') {
     this.selectedDesignation = { ...desig };
     if (mode === 'add') {
        this.selectedDesignation = { title: '', department: '' };
     }
     this.dialogMode = mode;
     this.dialogVisible = true;
   }
 
   closeDialog() {
     this.dialogVisible = false;
     this.dialogMode = '';
   }
 
   confirmDelete() {
     if (!this.selectedDesignation) return;
     this.loader.start();
     this.api
       .get(`designations/delete/${this.selectedDesignation.id}`)
       .subscribe({
         next: () => {
           this.getAllDesignations();
           this.closeDialog();
           this.loader.stop();
         },
         error: (err) => {
           console.error('Delete failed', err), 
           this.loader.stop();
         },
       });
   }
 
   saveChanges() {
     if (this.dialogMode === 'edit') {
       this.loader.start();
       console.log(this.selectedDesignation);
       this.api
         .post(
           `designations/edit/${this.selectedDesignation.id}`,
           this.selectedDesignation
         )
         .subscribe({
           next: () => {
              this.closeDialog();
             this.getAllDesignations();
            
             
           },
           error: (err) => {
             console.error('Update failed', err), this.loader.stop();
           },
         });
     }
   }
   addDesignation() {
     this.loader.start();
     this.api.post('designations/add', this.selectedDesignation).subscribe({
       next: () => {
         this.getAllDesignations();
         this.closeDialog();
         this.loader.stop();
       },
       error: (err) => {
         console.error('Update failed', err), this.loader.stop();
       },
     });
   }
 
}
