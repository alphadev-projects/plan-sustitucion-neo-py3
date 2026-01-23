import { ENV } from './_core/env';

/**
 * Tipos de notificaciones de email
 */
export type NotificationType = 
  | 'plan_created'
  | 'plan_status_changed'
  | 'plan_high_risk'
  | 'action_deadline_approaching'
  | 'action_overdue'
  | 'action_completed';

/**
 * Interfaz para datos de notificación
 */
export interface NotificationData {
  type: NotificationType;
  recipient: string;
  recipientEmail: string;
  subject: string;
  body: string;
  planId?: number;
  planTitle?: string;
  actionId?: number;
  actionTitle?: string;
  oldStatus?: string;
  newStatus?: string;
  riskLevel?: string;
  dueDate?: Date;
}

/**
 * Servicio de notificaciones por email
 * Utiliza la API de Manus para enviar emails
 */
export class EmailNotificationService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = ENV.forgeApiUrl || '';
    this.apiKey = ENV.forgeApiKey || '';
  }

  /**
   * Envía una notificación de email
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!this.apiUrl || !this.apiKey) {
        console.warn('[EmailNotification] API credentials not configured');
        return false;
      }

      const emailContent = this.generateEmailContent(data);

      // Llamar a la API de Manus para enviar email
      const response = await fetch(`${this.apiUrl}/notification/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: data.recipientEmail,
          subject: data.subject,
          html: emailContent,
          text: this.generatePlainTextContent(data),
        }),
      });

      if (!response.ok) {
        console.error('[EmailNotification] Failed to send email:', response.statusText);
        return false;
      }

      console.log(`[EmailNotification] Email sent to ${data.recipientEmail}`);
      return true;
    } catch (error) {
      console.error('[EmailNotification] Error sending email:', error);
      return false;
    }
  }

  /**
   * Genera contenido HTML del email
   */
  private generateEmailContent(data: NotificationData): string {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
        .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 3px; }
        .alert.danger { background-color: #fee2e2; border-left-color: #ef4444; }
        .alert.success { background-color: #dcfce7; border-left-color: #22c55e; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; margin-top: 10px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
      </style>
    `;

    const body = this.getEmailBodyByType(data);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Plan de Sucesión - Notificación</h2>
          </div>
          <div class="content">
            <p>Hola ${data.recipient},</p>
            ${body}
            <div class="footer">
              <p>Este es un mensaje automático del Sistema de Gestión de Planes de Sucesión.</p>
              <p>Por favor no responda a este email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera contenido de texto plano del email
   */
  private generatePlainTextContent(data: NotificationData): string {
    return `
Plan de Sucesión - Notificación

Hola ${data.recipient},

${data.body}

---
Este es un mensaje automático del Sistema de Gestión de Planes de Sucesión.
Por favor no responda a este email.
    `.trim();
  }

  /**
   * Obtiene el cuerpo del email según el tipo de notificación
   */
  private getEmailBodyByType(data: NotificationData): string {
    switch (data.type) {
      case 'plan_created':
        return `
          <p>Se ha creado un nuevo plan de sucesión:</p>
          <div class="alert">
            <strong>${data.planTitle}</strong><br>
            ID: ${data.planId}
          </div>
          <p>Por favor revise los detalles del plan en el sistema.</p>
        `;

      case 'plan_status_changed':
        return `
          <p>El estado del plan de sucesión ha cambiado:</p>
          <div class="alert">
            <strong>${data.planTitle}</strong><br>
            Estado anterior: ${data.oldStatus}<br>
            Estado nuevo: ${data.newStatus}
          </div>
          <p>Por favor revise los cambios en el sistema.</p>
        `;

      case 'plan_high_risk':
        return `
          <p class="alert danger">
            <strong>⚠️ ALERTA DE RIESGO ALTO</strong>
          </p>
          <p>Se ha identificado un puesto crítico con riesgo alto de continuidad:</p>
          <div class="alert danger">
            <strong>${data.planTitle}</strong><br>
            Nivel de Riesgo: ${data.riskLevel}<br>
            Acción requerida: Asignar reemplazo o plan de sucesión
          </div>
          <p>Se requiere atención inmediata.</p>
        `;

      case 'action_deadline_approaching':
        return `
          <p>Una acción del plan de sucesión está próxima a vencer:</p>
          <div class="alert">
            <strong>${data.actionTitle}</strong><br>
            Fecha de vencimiento: ${data.dueDate?.toLocaleDateString('es-UY')}<br>
            Plan: ${data.planTitle}
          </div>
          <p>Por favor complete o actualice el progreso de esta acción.</p>
        `;

      case 'action_overdue':
        return `
          <p class="alert danger">
            <strong>⚠️ ACCIÓN VENCIDA</strong>
          </p>
          <p>Una acción del plan de sucesión ha vencido:</p>
          <div class="alert danger">
            <strong>${data.actionTitle}</strong><br>
            Fecha de vencimiento: ${data.dueDate?.toLocaleDateString('es-UY')}<br>
            Plan: ${data.planTitle}
          </div>
          <p>Se requiere atención inmediata.</p>
        `;

      case 'action_completed':
        return `
          <p class="alert success">
            <strong>✓ ACCIÓN COMPLETADA</strong>
          </p>
          <p>Una acción del plan de sucesión ha sido completada:</p>
          <div class="alert success">
            <strong>${data.actionTitle}</strong><br>
            Plan: ${data.planTitle}
          </div>
          <p>Felicidades por completar esta acción.</p>
        `;

      default:
        return `<p>${data.body}</p>`;
    }
  }
}

/**
 * Instancia global del servicio de notificaciones
 */
let emailService: EmailNotificationService | null = null;

/**
 * Obtiene la instancia del servicio de notificaciones
 */
export function getEmailNotificationService(): EmailNotificationService {
  if (!emailService) {
    emailService = new EmailNotificationService();
  }
  return emailService;
}

/**
 * Notifica cuando se crea un nuevo plan de sucesión
 */
export async function notifyPlanCreated(
  planId: number,
  planTitle: string,
  recipientEmail: string,
  recipientName: string
): Promise<boolean> {
  const service = getEmailNotificationService();
  return service.sendNotification({
    type: 'plan_created',
    recipient: recipientName,
    recipientEmail,
    subject: `Nuevo Plan de Sucesión: ${planTitle}`,
    body: `Se ha creado un nuevo plan de sucesión: ${planTitle}`,
    planId,
    planTitle,
  });
}

/**
 * Notifica cuando cambia el estado de un plan
 */
export async function notifyPlanStatusChanged(
  planId: number,
  planTitle: string,
  oldStatus: string,
  newStatus: string,
  recipientEmail: string,
  recipientName: string
): Promise<boolean> {
  const service = getEmailNotificationService();
  return service.sendNotification({
    type: 'plan_status_changed',
    recipient: recipientName,
    recipientEmail,
    subject: `Cambio de Estado: ${planTitle}`,
    body: `El estado del plan ha cambiado de ${oldStatus} a ${newStatus}`,
    planId,
    planTitle,
    oldStatus,
    newStatus,
  });
}

/**
 * Notifica cuando se detecta un puesto crítico con riesgo alto
 */
export async function notifyHighRiskPosition(
  planId: number,
  planTitle: string,
  riskLevel: string,
  recipientEmail: string,
  recipientName: string
): Promise<boolean> {
  const service = getEmailNotificationService();
  return service.sendNotification({
    type: 'plan_high_risk',
    recipient: recipientName,
    recipientEmail,
    subject: `⚠️ ALERTA: Puesto Crítico con Riesgo Alto - ${planTitle}`,
    body: `Se ha detectado un puesto crítico con riesgo alto: ${planTitle}`,
    planId,
    planTitle,
    riskLevel,
  });
}

/**
 * Notifica cuando una acción está próxima a vencer
 */
export async function notifyActionDeadlineApproaching(
  actionId: number,
  actionTitle: string,
  planTitle: string,
  dueDate: Date,
  recipientEmail: string,
  recipientName: string
): Promise<boolean> {
  const service = getEmailNotificationService();
  return service.sendNotification({
    type: 'action_deadline_approaching',
    recipient: recipientName,
    recipientEmail,
    subject: `Acción próxima a vencer: ${actionTitle}`,
    body: `La acción "${actionTitle}" vence el ${dueDate.toLocaleDateString('es-UY')}`,
    actionId,
    actionTitle,
    planTitle,
    dueDate,
  });
}

/**
 * Notifica cuando una acción está vencida
 */
export async function notifyActionOverdue(
  actionId: number,
  actionTitle: string,
  planTitle: string,
  dueDate: Date,
  recipientEmail: string,
  recipientName: string
): Promise<boolean> {
  const service = getEmailNotificationService();
  return service.sendNotification({
    type: 'action_overdue',
    recipient: recipientName,
    recipientEmail,
    subject: `⚠️ ACCIÓN VENCIDA: ${actionTitle}`,
    body: `La acción "${actionTitle}" está vencida desde ${dueDate.toLocaleDateString('es-UY')}`,
    actionId,
    actionTitle,
    planTitle,
    dueDate,
  });
}

/**
 * Notifica cuando una acción se completa
 */
export async function notifyActionCompleted(
  actionId: number,
  actionTitle: string,
  planTitle: string,
  recipientEmail: string,
  recipientName: string
): Promise<boolean> {
  const service = getEmailNotificationService();
  return service.sendNotification({
    type: 'action_completed',
    recipient: recipientName,
    recipientEmail,
    subject: `✓ Acción Completada: ${actionTitle}`,
    body: `La acción "${actionTitle}" ha sido completada exitosamente`,
    actionId,
    actionTitle,
    planTitle,
  });
}
