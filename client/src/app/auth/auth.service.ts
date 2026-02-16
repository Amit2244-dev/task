import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuth().subscribe();
  }

  checkAuth(): Observable<any> {
    return this.http.get<{ isAuthenticated: boolean, user: any }>(`${this.apiUrl}/auth/check-auth`, { withCredentials: true }).pipe(
      map(res => {
        if (res.isAuthenticated) {
          this.currentUserSubject.next(res.user);
          return res.user;
        } else {
          this.currentUserSubject.next(null);
          return null;
        }
      }),
      catchError(err => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

getCaptcha(): Observable<string> {
  return this.http.get(`${this.apiUrl}/auth/captcha`, {
    responseType: 'text',
    withCredentials: true
  });
}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap((res: any) => {
        this.currentUserSubject.next(res.user);
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.currentUserSubject.next(null);
      this.router.navigate(['/auth/login']);
    });
  }

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
