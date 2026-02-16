import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  captchaSvg: SafeHtml = '';
  errorMessage: string = '';
  captchaLoaded: boolean = false;
  captchaLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      captcha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCaptcha();
  }

  loadCaptcha() {
    this.captchaLoaded = false;
    this.captchaLoading = true;
    this.captchaSvg = '';
    this.errorMessage = '';
    this.authService.getCaptcha().subscribe({
      next: (svg: string) => {
        console.log('CAPTCHA response length:', svg);
        this.captchaSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.captchaLoaded = true;
        this.captchaLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load captcha', err);
        this.errorMessage = 'Unable to load CAPTCHA. Please try again.';
        this.captchaLoaded = false;
        this.captchaLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.errorMessage = err.message || 'Login failed';
          this.loadCaptcha();
        }
      });
    }
  }
}
