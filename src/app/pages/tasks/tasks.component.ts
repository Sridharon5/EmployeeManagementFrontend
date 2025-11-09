import { Component } from '@angular/core';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tasks',
  imports: [ButtonModule,FormsModule,DialogModule,CommonModule,TableModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  tasks: any[] = [];
  selectedTask: any = null;
  dialogVisible: boolean = false;
  dialogMode: 'view' | 'edit' | 'delete' | 'add' | '' = '';

  constructor(private api: ApiClient, private loader: NgxUiLoaderService) {}

  ngOnInit(): void {
    this.getAllTasks();
  }

  getAllTasks() {
    this.loader.start();
    this.api.get('tasks/getAllTasks').subscribe({
      next: (res: any) => {
        this.tasks = res.data || res;
        this.loader.stop();
      },
      error: (err) => {
        console.error('Error fetching tasks', err);
        this.loader.stop();
      },
    });
  }

  openDialog(task: any, mode: 'view' | 'add' | 'edit' | 'delete') {
    this.selectedTask = { ...task };
    if (mode === 'add') {
      this.selectedTask = { title: '', department: '' };
    }
    this.dialogMode = mode;
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.dialogMode = '';
  }

  confirmDelete() {
    if (!this.selectedTask) return;
    this.loader.start();
    this.api
      .get(`tasks/delete/${this.selectedTask.id}`)
      .subscribe({
        next: () => {
          this.getAllTasks();
          this.closeDialog();
          this.loader.stop();
        },
        error: (err) => {
          console.error('Delete failed', err), this.loader.stop();
        },
      });
  }

  saveChanges() {
    if (this.dialogMode === 'edit') {
      this.loader.start();
      console.log(this.selectedTask);
      this.api
        .post(
          `tasks/edit/${this.selectedTask.id}`,
          this.selectedTask
        )
        .subscribe({
          next: () => {
            this.closeDialog();
            this.getAllTasks();
          },
          error: (err) => {
            console.error('Update failed', err), this.loader.stop();
          },
        });
    }
  }
  addDesignation() {
    this.loader.start();
    this.api.post('tasks/add', this.selectedTask).subscribe({
      next: () => {
        this.getAllTasks();
        this.closeDialog();
        this.loader.stop();
      },
      error: (err) => {
        console.error('Update failed', err), this.loader.stop();
      },
    });
  }
}
