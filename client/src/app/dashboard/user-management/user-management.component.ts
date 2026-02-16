import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  @Output() transferClick = new EventEmitter<any>();
    public apiUrl = 'http://localhost:5000/api';

  downline: any[] = [];
  showCreateForm = false;
  createUserForm: FormGroup;
  message = '';
  showPasswordForm: any = null;
  newPassword = '';
  passwordMessage = '';

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.createUserForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadDownline();
  }

  loadDownline() {
    this.http.get<any[]>(`${this.apiUrl}/users/downline`)
      .subscribe(res => this.downline = res);
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    this.message = '';
  }

  createUser() {
    if (this.createUserForm.valid) {
      this.http.post(`${this.apiUrl}/users/create`, this.createUserForm.value)
        .subscribe({
          next: () => {
            this.message = 'User created successfully';
            this.createUserForm.reset();
            this.loadDownline();
            setTimeout(() => this.showCreateForm = false, 2000);
          },
          error: (err) => this.message = 'Error: ' + (err.error?.message || err.message)
        });
    }
  }

  changePassword(user: any) {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.passwordMessage = 'Password must be at least 6 characters';
      return;
    }
    this.http.post(`${this.apiUrl}/users/change-password`, { userId: user._id, newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.passwordMessage = 'Password changed!';
          this.newPassword = '';
          setTimeout(() => {
            this.showPasswordForm = null;
            this.passwordMessage = '';
          }, 2000);
        },
        error: (err) => {
          this.passwordMessage = err.error?.message || 'Failed to change password';
        }
      });
  }
}
