import { Component } from '@angular/core';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { resolveApiMessage } from '../../utils/api-message.util';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-designation',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
  ],
  templateUrl: './designation.component.html',
})
export class DesignationComponent {
   designations: any[] = [];
   selectedDesignation: any = null;
   dialogVisible: boolean = false;
   dialogMode: 'view' | 'edit' | 'delete' | 'add' | '' = '';
 
   constructor(
     private api: ApiClient,
     private loader: NgxUiLoaderService,
     private messageService: MessageService,
     readonly auth: AuthService
   ) {}
 
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
         this.loader.stop();
         this.messageService.add({
           severity: 'error',
           summary: 'Designations',
           detail: resolveApiMessage(err, 'Could not load designations.'),
         });
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
           this.messageService.add({
             severity: 'success',
             summary: 'Deleted',
             detail: 'Designation removed successfully.',
           });
         },
         error: (err) => {
           this.loader.stop();
           this.messageService.add({
             severity: 'error',
             summary: 'Delete failed',
             detail: resolveApiMessage(err, 'Could not delete designation.'),
           });
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
             this.loader.stop();
             this.messageService.add({
               severity: 'success',
               summary: 'Saved',
               detail: 'Designation updated successfully.',
             });
           },
           error: (err) => {
             this.loader.stop();
             this.messageService.add({
               severity: 'error',
               summary: 'Update failed',
               detail: resolveApiMessage(err, 'Could not update designation.'),
             });
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
         this.messageService.add({
           severity: 'success',
           summary: 'Added',
           detail: 'Designation created successfully.',
         });
       },
       error: (err) => {
         this.loader.stop();
         this.messageService.add({
           severity: 'error',
           summary: 'Could not add',
           detail: resolveApiMessage(err, 'Could not create designation.'),
         });
       },
     });
   }
 
}
