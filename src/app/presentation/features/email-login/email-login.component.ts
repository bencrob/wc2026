import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AccountSyncService } from '../../../application/account-sync.service';

/**
 * Connexion par e-mail (code OTP, sans mot de passe).
 *
 * Deux étapes : saisie de l'e-mail → saisie du code reçu. Aucune redirection
 * → l'utilisateur reste dans l'app (idéal iOS/PWA). La session ouverte déclenche
 * ensuite le flux pseudo/synchro géré par `AccountSyncService`.
 */
@Component({
  selector: 'wc-email-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './email-login.component.html',
  styleUrl: './email-login.component.scss',
})
export class EmailLoginComponent {
  private readonly account = inject(AccountSyncService);
  private readonly ref = inject(MatDialogRef<EmailLoginComponent>);

  protected readonly step = signal<'email' | 'code'>('email');
  protected readonly email = signal('');
  protected readonly code = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async sendCode(): Promise<void> {
    const email = this.email().trim();
    if (!email || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    const res = await this.account.requestEmailCode(email);
    this.busy.set(false);
    if (res.ok) this.step.set('code');
    else this.error.set(res.error);
  }

  protected async verify(): Promise<void> {
    const code = this.code().trim();
    if (!code || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    const res = await this.account.verifyEmailCode(this.email().trim(), code);
    this.busy.set(false);
    if (res.ok) this.ref.close();
    else this.error.set(res.error);
  }
}
