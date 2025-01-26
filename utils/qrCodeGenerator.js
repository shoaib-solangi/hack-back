import QRCode from "qrcode";

export const generateQRCode = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(data);
    return qrCode;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};
