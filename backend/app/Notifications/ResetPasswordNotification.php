<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail(mixed $notifiable): MailMessage
    {
        $url = config('app.frontend_url', 'http://localhost:3000')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Redefinição de senha — Prosperar')
            ->greeting("Olá, {$notifiable->name}!")
            ->line('Recebemos uma solicitação para redefinir a senha da sua conta.')
            ->action('Redefinir minha senha', $url)
            ->line('Este link expira em ' . config('auth.passwords.users.expire', 60) . ' minutos.')
            ->line('Se você não solicitou a redefinição, nenhuma ação é necessária.')
            ->salutation('Equipe Prosperar');
    }
}
