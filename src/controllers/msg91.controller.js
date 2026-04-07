import https from 'https';
import { URLSearchParams } from 'url';

const MSG91_HOST = 'control.msg91.com';
const MSG91_PATH = '/api/v5/widget/verifyAccessToken';
const MSG91_SEND_OTP_PATH = '/api/v5/otp';
const MSG91_VERIFY_OTP_PATH = '/api/v5/otp/verify';

function postJson(host, path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: host,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 10000,
      },
      (res) => {
        let raw = '';

        res.on('data', (chunk) => {
          raw += chunk;
        });

        res.on('end', () => {
          let parsed;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch {
            parsed = { raw };
          }

          resolve({
            statusCode: res.statusCode || 500,
            data: parsed,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('MSG91 request timed out'));
    });

    req.on('error', (err) => reject(err));

    req.write(body);
    req.end();
  });
}

function getJson(host, path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path,
        method: 'GET',
        timeout: 10000,
      },
      (res) => {
        let raw = '';

        res.on('data', (chunk) => {
          raw += chunk;
        });

        res.on('end', () => {
          let parsed;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch {
            parsed = { raw };
          }

          resolve({
            statusCode: res.statusCode || 500,
            data: parsed,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('MSG91 request timed out'));
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

function normalizeIndianMobile(input) {
  const digits = String(input || '').replace(/\D/g, '');

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return null;
}

function isMsg91Success(statusCode, data) {
  const statusOk = statusCode >= 200 && statusCode < 300;
  if (!statusOk) {
    return false;
  }

  if (data && typeof data.type === 'string') {
    return data.type.toLowerCase() === 'success';
  }

  return true;
}

/**
 * POST /api/msg91/verify-access-token
 * Body: { accessToken } or { "access-token": "..." }
 */
export const verifyAccessToken = async (req, res) => {
  try {
    const authkey = process.env.MSG91_AUTH_KEY;
    const accessToken = req.body?.accessToken || req.body?.['access-token'];

    if (!authkey) {
      return res.status(500).json({
        success: false,
        message: 'MSG91 auth key is missing. Set MSG91_AUTH_KEY in backend .env',
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'accessToken is required',
      });
    }

    const result = await postJson(MSG91_HOST, MSG91_PATH, {
      authkey,
      'access-token': accessToken,
    });

    return res.status(result.statusCode).json({
      success: isMsg91Success(result.statusCode, result.data),
      msg91: result.data,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error.message || 'Failed to verify access token with MSG91',
    });
  }
};

/**
 * POST /api/msg91/send-otp
 * Body: { phoneNumber }
 */
export const sendOtp = async (req, res) => {
  try {
    const authkey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const phoneNumber = req.body?.phoneNumber;
    const mobile = normalizeIndianMobile(phoneNumber);

    if (!authkey) {
      return res.status(500).json({
        success: false,
        message: 'MSG91 auth key is missing. Set MSG91_AUTH_KEY in backend .env',
      });
    }

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Valid phoneNumber is required (10 digits or 91XXXXXXXXXX)',
      });
    }

    // Use POST with proper payload instead of GET
    const payload = {
      authkey,
      mobile,
      otp_expiry: '5',
      otp_length: '6',
    };

    if (templateId) {
      payload.template_id = templateId;
    }

    const result = await postJson(MSG91_HOST, MSG91_SEND_OTP_PATH, payload);

    return res.status(result.statusCode).json({
      success: isMsg91Success(result.statusCode, result.data),
      msg91: result.data,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error.message || 'Failed to send OTP with MSG91',
    });
  }
};

/**
 * POST /api/msg91/verify-otp
 * Body: { phoneNumber, otp }
 */
export const verifyOtp = async (req, res) => {
  try {
    const authkey = process.env.MSG91_AUTH_KEY;
    const phoneNumber = req.body?.phoneNumber;
    const otp = String(req.body?.otp || '').trim();
    const mobile = normalizeIndianMobile(phoneNumber);

    if (!authkey) {
      return res.status(500).json({
        success: false,
        message: 'MSG91 auth key is missing. Set MSG91_AUTH_KEY in backend .env',
      });
    }

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Valid phoneNumber is required (10 digits or 91XXXXXXXXXX)',
      });
    }

    if (!/^\d{4,8}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Valid otp is required',
      });
    }

    const payload = {
      authkey,
      mobile,
      otp,
    };

    const result = await postJson(MSG91_HOST, MSG91_VERIFY_OTP_PATH, payload);

    return res.status(result.statusCode).json({
      success: isMsg91Success(result.statusCode, result.data),
      msg91: result.data,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error.message || 'Failed to verify OTP with MSG91',
    });
  }
};
