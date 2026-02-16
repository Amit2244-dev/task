import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.css']
})
export class TransferModalComponent implements OnInit {

  @Input() toUser: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() transferComplete = new EventEmitter<void>();

  transferForm: FormGroup;
  children: any[] = [];
  message = '';
  isError = false;
  apiUrl: string = 'http://localhost:5000/api';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.transferForm = this.fb.group({
      toUserId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadChildren();
    if (this.toUser) {
      this.transferForm.patchValue({ toUserId: this.toUser._id });
    }
  }

  loadChildren() {
    this.http.get<any[]>(`${this.apiUrl}/users/children`)
      .subscribe(res => this.children = res);
  }

  onSubmit() {
    if (this.transferForm.valid) {
      this.http.post(`${this.apiUrl}/transactions/transfer`, this.transferForm.value)
        .subscribe({
          next: () => {
            this.message = 'Transfer Successful!';
            this.isError = false;
            this.transferForm.reset();
            setTimeout(() => {
              this.transferComplete.emit();
              this.close.emit();
            }, 1500);
          },
          error: (err) => {
            this.message = err.error?.message || 'Transfer failed';
            this.isError = true;
          }
        });
    }
  }
}
