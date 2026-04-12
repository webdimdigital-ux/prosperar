<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Bem-vindo ao Prosperar!')
            ->greeting("Olá, {$notifiable->name}!")
            ->line('Sua conta foi criada com sucesso. Agora você pode acessar seus exames e laudos médicos a qualquer momento.')
            ->action('Acessar minha conta', config('app.frontend_url', 'http://localhost:3000') . '/login')
            ->line('Se você não criou esta conta, ignore este e-mail.')
            ->salutation('Equipe Prosperar');
    }
}
