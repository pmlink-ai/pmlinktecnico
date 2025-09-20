import * as MailComposer from 'expo-mail-composer';
import { Alert } from 'react-native';

// ==================== SERVICIO DE EMAIL ====================
export class EmailService {
  
  // Verificar si el dispositivo puede enviar emails
  static async isEmailAvailable() {
    try {
      return await MailComposer.isAvailableAsync();
    } catch (error) {
      console.error('Error verificando disponibilidad de email:', error);
      return false;
    }
  }

  // Enviar PDF por email
  static async sendPDFByEmail(pdfUri, orderData, recipientEmail = '') {
    try {
      // Verificar disponibilidad
      const isAvailable = await this.isEmailAvailable();
      if (!isAvailable) {
        Alert.alert(
          'Email no disponible',
          'Este dispositivo no tiene configurado un cliente de email'
        );
        return { success: false, error: 'Email no disponible' };
      }

      // Preparar datos del email
      const subject = `Informe de Limpieza de Ductos - ${orderData.titulo || 'Orden #' + orderData.id?.substring(0, 8)}`;
      const body = this.generateEmailBody(orderData);

      // Configurar y enviar email
      const result = await MailComposer.composeAsync({
        recipients: recipientEmail ? [recipientEmail] : [],
        subject: subject,
        body: body,
        isHtml: true,
        attachments: [pdfUri],
      });

      console.log('📧 Resultado del email:', result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      Alert.alert('Error', 'No se pudo enviar el email: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Generar cuerpo del email
  static generateEmailBody(orderData) {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">PMDUC - Expertos en Ductos</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Informe de Limpieza de Ductos</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #2196F3; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #2196F3;">Detalles del Servicio</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Orden de Trabajo:</td>
                  <td style="padding: 8px 0;">#${orderData.id?.substring(0, 12) || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Título:</td>
                  <td style="padding: 8px 0;">${orderData.titulo || 'Sin título'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Fecha de Servicio:</td>
                  <td style="padding: 8px 0;">${formatDate(orderData.created_at)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Estado:</td>
                  <td style="padding: 8px 0;">${orderData.estados_orden_trabajo?.nombre || 'Sin estado'}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #2196F3;">Descripción del Trabajo</h3>
              <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                ${orderData.descripcion_corta || 'Sin descripción disponible'}
                ${orderData.descripcion_larga ? '<br><br>' + orderData.descripcion_larga : ''}
              </p>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #4CAF50;">📋 Informe Adjunto</h3>
              <p>Se adjunta el informe completo de limpieza de ductos en formato PDF, que incluye:</p>
              <ul>
                <li>Diagnóstico detallado de todos los componentes</li>
                <li>Fotografías del estado antes, durante y después del servicio</li>
                <li>Observaciones técnicas del servicio realizado</li>
                <li>Documentación de conformidad del trabajo</li>
              </ul>
            </div>

            <div style="border-top: 2px solid #2196F3; padding-top: 20px; text-align: center; color: #666;">
              <p><strong>PMDUC - Expertos en Ductos</strong></p>
              <p>Especialistas en limpieza y mantenimiento de sistemas de extracción</p>
              <p style="font-size: 12px;">
                Este email fue generado automáticamente desde nuestra aplicación móvil de gestión de servicios.<br>
                Fecha de envío: ${formatDate(new Date().toISOString())}
              </p>
            </div>

          </div>
        </body>
      </html>
    `;
  }

  // Solicitar email del destinatario
  static promptForRecipientEmail() {
    return new Promise((resolve) => {
      Alert.prompt(
        'Enviar por Email',
        'Ingresa el email del destinatario (opcional):',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null)
          },
          {
            text: 'Enviar',
            onPress: (email) => resolve(email || '')
          }
        ],
        'plain-text',
        '',
        'email-address'
      );
    });
  }
}

export default EmailService;