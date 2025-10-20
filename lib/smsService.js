// SMS Service - รองรับหลาย SMS Gateway
require('dotenv').config({ path: '.env.local' });

// SMS Provider Interface
class SMSProvider {
  async sendSMS(phoneNumber, message) {
    throw new Error('SMSProvider.sendSMS must be implemented');
  }
}

// Twilio SMS Provider
class TwilioSMSProvider extends SMSProvider {
  constructor() {
    super();
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(phoneNumber, message) {
    try {
      // TODO: Implement when ready
      // const client = require('twilio')(this.accountSid, this.authToken);
      // const result = await client.messages.create({
      //   body: message,
      //   from: this.fromNumber,
      //   to: phoneNumber
      // });
      
      // For now, just log
      console.log('📱 SMS (Twilio - Mock):', {
        to: phoneNumber,
        message: message
      });
      
      return {
        success: true,
        provider: 'twilio',
        messageId: 'mock_' + Date.now()
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Thai Bulk SMS Provider (สำหรับ SMS Gateway ในไทย)
class ThaiBulkSMSProvider extends SMSProvider {
  constructor() {
    super();
    this.apiKey = process.env.SMS_API_KEY;
    this.apiSecret = process.env.SMS_API_SECRET;
    this.sender = process.env.SMS_SENDER || 'OBT_SMART';
  }

  async sendSMS(phoneNumber, message) {
    try {
      // TODO: Implement when ready with actual SMS gateway
      // const response = await fetch('https://api.thaibulksms.com/v1/send', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   body: JSON.stringify({
      //     to: phoneNumber,
      //     message: message,
      //     sender: this.sender
      //   })
      // });
      
      // For now, just log
      console.log('📱 SMS (Thai Bulk SMS - Mock):', {
        to: phoneNumber,
        message: message,
        sender: this.sender
      });
      
      return {
        success: true,
        provider: 'thaibulksms',
        messageId: 'mock_' + Date.now()
      };
    } catch (error) {
      console.error('Thai Bulk SMS error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Console SMS Provider (สำหรับ Development/Testing)
class ConsoleSMSProvider extends SMSProvider {
  async sendSMS(phoneNumber, message) {
    console.log('\n📱 =============== SMS NOTIFICATION ===============');
    console.log(`📞 To: ${phoneNumber}`);
    console.log(`📄 Message: ${message}`);
    console.log('=================================================\n');
    
    return {
      success: true,
      provider: 'console',
      messageId: 'console_' + Date.now()
    };
  }
}

// SMS Service Manager
class SMSService {
  constructor() {
    // เลือก provider ตามสภาพแวดล้อม
    const provider = process.env.SMS_PROVIDER || 'console';
    
    switch (provider) {
      case 'twilio':
        this.provider = new TwilioSMSProvider();
        break;
      case 'thaibulksms':
        this.provider = new ThaiBulkSMSProvider();
        break;
      default:
        this.provider = new ConsoleSMSProvider();
    }
  }
  
  // เปลี่ยน provider
  setProvider(provider) {
    this.provider = provider;
  }
  
  // ส่ง SMS
  async sendSMS(phoneNumber, message) {
    // Validate phone number
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return {
        success: false,
        error: 'Invalid phone number'
      };
    }
    
    // Format phone number (remove dashes, spaces)
    const formattedPhone = phoneNumber.replace(/[-\s]/g, '');
    
    // Send SMS via provider
    return await this.provider.sendSMS(formattedPhone, message);
  }
  
  // ส่ง SMS แจ้งรับเรื่องสำเร็จ
  async sendReportConfirmation(phoneNumber, ticketId, reportType) {
    const typeText = reportType === 'repair' ? 'แจ้งซ่อม' : 'คำร้อง';
    const message = `Smart OBT: รับเรื่อง${typeText}ของท่านแล้ว รหัสติดตาม: ${ticketId} ตรวจสอบที่ http://localhost:3002/track/${ticketId}`;
    
    return await this.sendSMS(phoneNumber, message);
  }
  
  // ส่ง SMS แจ้งเปลี่ยนสถานะ
  async sendStatusUpdate(phoneNumber, ticketId, status) {
    const message = `Smart OBT: รหัส ${ticketId} สถานะ: ${status}`;
    
    return await this.sendSMS(phoneNumber, message);
  }
  
  // ส่ง SMS แจ้งงานเสร็จสิ้น
  async sendCompletionNotification(phoneNumber, ticketId) {
    const message = `Smart OBT: รหัส ${ticketId} ดำเนินการเสร็จสิ้นแล้ว กรุณาให้คะแนนความพึงพอใจ`;
    
    return await this.sendSMS(phoneNumber, message);
  }
}

// Export singleton instance
const smsService = new SMSService();
module.exports = smsService;

// Export classes for testing
module.exports.SMSProvider = SMSProvider;
module.exports.TwilioSMSProvider = TwilioSMSProvider;
module.exports.ThaiBulkSMSProvider = ThaiBulkSMSProvider;
module.exports.ConsoleSMSProvider = ConsoleSMSProvider;
module.exports.SMSService = SMSService;

