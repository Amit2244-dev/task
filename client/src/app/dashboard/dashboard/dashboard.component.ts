import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { UserManagementComponent } from '../user-management/user-management.component';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, UserManagementComponent, TransferModalComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    apiUrl = 'http://localhost:5000/api';
    currentUser: any = null;
    balance: number = 0;
    transactions: any[] = [];
    showTransferModal = false;
    selectedChildUser: any = null;
    activeTab: string = 'transactions';
    rechargeAmount: number = 0;
    rechargeMessage: string = '';

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.loadBalance();
                this.loadTransactions();
            }
        });

        if (!this.currentUser) {
            this.authService.checkAuth().subscribe({
                next: (user) => {
                    if (!user) {
                        this.router.navigate(['/auth/login']);
                    }
                },
                error: () => this.router.navigate(['/auth/login'])
            });
        }
    }

    loadBalance() {
        this.http.get<{ balance: number }>(`${this.apiUrl}/users/balance`)
            .subscribe({
                next: (res) => this.balance = res.balance,
                error: (err) => console.error('Failed to load balance', err)
            });
    }

    loadTransactions() {
        this.http.get<any[]>(`${this.apiUrl}/transactions/history`)
            .subscribe({
                next: (res) => this.transactions = res,
                error: (err) => console.error('Failed to load transactions', err)
            });
    }

    openTransferModal(childUser: any) {
        this.selectedChildUser = childUser;
        this.showTransferModal = true;
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    closeTransferModal() {
        this.showTransferModal = false;
        this.selectedChildUser = null;
    }

    onTransferSuccess() {
        this.closeTransferModal();
        this.loadBalance();
        this.loadTransactions();
    }

    selfRecharge() {
        if (this.rechargeAmount <= 0) {
            this.rechargeMessage = 'Enter a valid amount';
            return;
        }
        this.http.post<{ balance: number }>(`${this.apiUrl}/users/self-recharge`, { amount: this.rechargeAmount })
            .subscribe({
                next: (res) => {
                    this.balance = res.balance;
                    this.rechargeMessage = 'Recharged successfully!';
                    this.rechargeAmount = 0;
                    this.loadTransactions();
                    setTimeout(() => this.rechargeMessage = '', 3000);
                },
                error: (err) => {
                    this.rechargeMessage = err.error?.message || 'Recharge failed';
                }
            });
    }

    logout() {
        this.authService.logout();
    }
}
