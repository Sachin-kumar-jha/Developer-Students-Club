import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import logoImage from "../assets/image.png";

/**
 * Standard Certificate Dimensions (Landscape A4 High-DPI ratio: 2000 x 1414)
 */
export const CERT_WIDTH = 2000;
export const CERT_HEIGHT = 1414;

export const PRODUCTION_FRONTEND_URL = "https://developer-students-club-4qfd.vercel.app";

/**
 * Generates the verification URL that the QR code will point to.
 * Ensures that scanning the QR code with any smartphone camera always opens
 * the live production website (not localhost, which is unreachable from mobile devices).
 */
export const getVerificationUrl = (certificateId) => {
  if (!certificateId) return "";

  // 1. Explicit environment variable override
  const envUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_FRONTEND_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, "");
    return `${cleanUrl}/#/verify/${certificateId}`;
  }

  // 2. In browser environment
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local");

    // If running on localhost, use production domain so phone cameras scanning QR codes reach the live site!
    if (isLocal) {
      return `${PRODUCTION_FRONTEND_URL}/#/verify/${certificateId}`;
    }

    // When deployed on production (Vercel / Render / Custom Domain), use the live origin
    return `${window.location.origin}/#/verify/${certificateId}`;
  }

  return `${PRODUCTION_FRONTEND_URL}/#/verify/${certificateId}`;
};

/**
 * Loads an image asynchronously with CORS and fetch blob fallback
 */
const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = async () => {
      try {
        // Fallback: fetch blob and convert to local object URL (bypasses any browser cached non-CORS header issues)
        const response = await fetch(src, { mode: "cors" });
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => {
            console.warn("Could not load image from objectUrl:", src);
            resolve(null);
          };
          fallbackImg.src = objectUrl;
          return;
        }
      } catch (err) {
        console.warn("Could not load image with fetch fallback:", src, err);
      }
      resolve(null);
    };
    img.src = src;
  });
};

/**
 * Renders the complete authentic certificate onto an HTML5 canvas
 * Supports both custom background template image and default DSC luxury template.
 */
export const renderCertificateToCanvas = async (canvas, certificate, templateConfig = {}) => {
  if (!canvas || !certificate) return;

  canvas.width = CERT_WIDTH;
  canvas.height = CERT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bgImageUrl =
    templateConfig.imageUrl ||
    certificate.templateConfig?.imageUrl ||
    certificate.event?.certificateTemplate?.imageUrl ||
    certificate.eventId?.certificateTemplate?.imageUrl ||
    "";

  // Coordinates & Styling Settings (from templateConfig, certificate, or event)
  const nameXPercent = Number(
    templateConfig.nameX ??
    certificate.templateConfig?.nameX ??
    certificate.event?.certificateTemplate?.nameX ??
    certificate.eventId?.certificateTemplate?.nameX ??
    50
  );
  const nameYPercent = Number(
    templateConfig.nameY ??
    certificate.templateConfig?.nameY ??
    certificate.event?.certificateTemplate?.nameY ??
    certificate.eventId?.certificateTemplate?.nameY ??
    41.5
  );
  const nameFontSize = Number(
    templateConfig.nameFontSize ??
    certificate.templateConfig?.nameFontSize ??
    certificate.event?.certificateTemplate?.nameFontSize ??
    certificate.eventId?.certificateTemplate?.nameFontSize ??
    54
  );
  const nameColor =
    templateConfig.nameColor ||
    certificate.templateConfig?.nameColor ||
    certificate.event?.certificateTemplate?.nameColor ||
    certificate.eventId?.certificateTemplate?.nameColor ||
    "#000000";

  const showRollNo = Boolean(
    templateConfig.showRollNo ??
    certificate.templateConfig?.showRollNo ??
    certificate.event?.certificateTemplate?.showRollNo ??
    certificate.eventId?.certificateTemplate?.showRollNo ??
    false
  );

  const qrXPercent = Number(
    templateConfig.qrX ??
    certificate.templateConfig?.qrX ??
    certificate.event?.certificateTemplate?.qrX ??
    certificate.eventId?.certificateTemplate?.qrX ??
    50
  );
  const qrYPercent = Number(
    templateConfig.qrY ??
    certificate.templateConfig?.qrY ??
    certificate.event?.certificateTemplate?.qrY ??
    certificate.eventId?.certificateTemplate?.qrY ??
    88
  );
  const qrSize = Number(
    templateConfig.qrSize ??
    certificate.templateConfig?.qrSize ??
    certificate.event?.certificateTemplate?.qrSize ??
    certificate.eventId?.certificateTemplate?.qrSize ??
    140
  );
  const transparentQr = Boolean(
    templateConfig.transparentQr ??
    certificate.templateConfig?.transparentQr ??
    certificate.event?.certificateTemplate?.transparentQr ??
    certificate.eventId?.certificateTemplate?.transparentQr ??
    true
  );

  const qrPosition =
    templateConfig.qrPosition ||
    certificate.templateConfig?.qrPosition ||
    certificate.event?.certificateTemplate?.qrPosition ||
    certificate.eventId?.certificateTemplate?.qrPosition ||
    "bottom-center";

  const verificationUrl = getVerificationUrl(certificate.certificateId);

  // Generate QR code data URL (High Error Correction)
  // Transparent QR if transparentQr is true (no white card/background)
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 360,
    margin: 0,
    color: {
      dark: "#000000",
      light: transparentQr ? "#00000000" : "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  const [bgImg, qrImg, logoImg] = await Promise.all([
    bgImageUrl ? loadImage(bgImageUrl) : null,
    loadImage(qrDataUrl),
    loadImage(logoImage),
  ]);

  if (bgImg) {
    // ------------------------------------------------------------------
    // CASE A: Custom Uploaded Background Template
    // ------------------------------------------------------------------
    ctx.drawImage(bgImg, 0, 0, CERT_WIDTH, CERT_HEIGHT);

    const recipientName = certificate.recipientName || "Student Name";
    const rollNo = certificate.recipientRollNo || "";
    const branch = certificate.recipientBranch || "";

    // 1. Recipient Name: Black font, user-selected X & Y coordinates and font size
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = nameColor;
    ctx.font = `bold ${nameFontSize}px 'Inter', sans-serif`;
    const nameX = (nameXPercent / 100) * CERT_WIDTH;
    const nameY = (nameYPercent / 100) * CERT_HEIGHT;
    ctx.fillText(recipientName.toUpperCase(), nameX, nameY);
    ctx.restore();

    // 2. Roll No & Branch details (ONLY rendered if explicitly enabled by admin)
    if (showRollNo) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = nameColor;
      ctx.font = "600 24px 'Inter', sans-serif";
      const detailsText = [rollNo ? `Roll No: ${rollNo}` : "", branch ? `Branch: ${branch}` : ""]
        .filter(Boolean)
        .join("  |  ");
      if (detailsText) {
        ctx.fillText(detailsText, nameX, nameY + nameFontSize * 0.8);
      }
      ctx.restore();
    }

    // 3. QR Code: Transparent directly on template (no white box) at exact user coordinates!
    if (qrImg) {
      const qX = (qrXPercent / 100) * CERT_WIDTH - qrSize / 2;
      const qY = (qrYPercent / 100) * CERT_HEIGHT - qrSize / 2;

      if (!transparentQr) {
        // Draw with white card only if explicitly requested
        drawQrBadge(ctx, qrImg, certificate.certificateId, "custom", qX, qY, qrSize);
      } else {
        // Transparent QR code directly on the background
        ctx.drawImage(qrImg, qX, qY, qrSize, qrSize);
      }
    }
  } else {
    // ------------------------------------------------------------------
    // CASE B: Default Ultra-Premium Developer Student Club Certificate
    // ------------------------------------------------------------------
    drawDefaultDscCertificate(ctx, certificate, qrImg, logoImg, qrPosition);
  }

  return canvas;
};

/**
 * Draws the high-contrast scannable QR verification badge
 */
const drawQrBadge = (ctx, qrImg, certId, position = "bottom-right") => {
  if (!qrImg) return;

  const cardW = 280;
  const cardH = 340;
  let cardX = CERT_WIDTH - cardW - 120;
  let cardY = CERT_HEIGHT - cardH - 120;

  if (position === "bottom-left") {
    cardX = 120;
    cardY = CERT_HEIGHT - cardH - 120;
  } else if (position === "bottom-center") {
    cardX = (CERT_WIDTH - cardW) / 2;
    cardY = CERT_HEIGHT - cardH - 100;
  }

  // White Card with drop shadow for 100% camera readability
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;

  // Background box
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, cardX, cardY, cardW, cardH, 20, true, false);
  ctx.restore();

  // Subtle border
  ctx.save();
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 20, false, true);
  ctx.restore();

  // Draw QR code image
  const qrSize = 220;
  const qrX = cardX + (cardW - qrSize) / 2;
  const qrY = cardY + 20;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Scan instruction
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 16px 'Inter', sans-serif";
  ctx.fillText("SCAN TO VERIFY", cardX + cardW / 2, cardY + qrSize + 45);

  // Certificate ID
  ctx.fillStyle = "#64748B";
  ctx.font = "600 13px 'Courier New', monospace";
  ctx.fillText(certId, cardX + cardW / 2, cardY + qrSize + 70);
  ctx.restore();
};

/**
 * Draws the default DSC luxury certificate
 */
const drawDefaultDscCertificate = (ctx, cert, qrImg, logoImg, qrPosition) => {
  // Rich Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, CERT_WIDTH, CERT_HEIGHT);
  bgGrad.addColorStop(0, "#080E14");
  bgGrad.addColorStop(0.5, "#0E1823");
  bgGrad.addColorStop(1, "#070C11");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CERT_WIDTH, CERT_HEIGHT);

  // Decorative border frames
  ctx.save();
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, CERT_WIDTH - 120, CERT_HEIGHT - 120);

  // Golden inner border
  const goldGrad = ctx.createLinearGradient(0, 0, CERT_WIDTH, 0);
  goldGrad.addColorStop(0, "#D97706");
  goldGrad.addColorStop(0.25, "#FCD34D");
  goldGrad.addColorStop(0.5, "#F59E0B");
  goldGrad.addColorStop(0.75, "#FDE68A");
  goldGrad.addColorStop(1, "#D97706");
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 4;
  ctx.strokeRect(80, 80, CERT_WIDTH - 160, CERT_HEIGHT - 160);
  ctx.restore();

  // Top Google colored accent lines (Blue, Red, Yellow, Green)
  const barY = 82;
  const barH = 7;
  const totalBarW = CERT_WIDTH - 164;
  const singleW = totalBarW / 4;
  const colors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(82 + i * singleW, barY, singleW, barH);
  });

  // DSC Logo
  if (logoImg) {
    ctx.drawImage(logoImg, (CERT_WIDTH - 100) / 2, 140, 100, 100);
  }

  // Header: DEVELOPER STUDENT CLUB RTU
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#38BDF8";
  ctx.font = "bold 26px 'Inter', sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("DEVELOPER STUDENT CLUB • RTU KOTA", CERT_WIDTH / 2, 280);

  // Main Title: CERTIFICATE OF PARTICIPATION
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 58px 'Inter', sans-serif";
  ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
  ctx.shadowBlur = 20;
  ctx.fillText("CERTIFICATE OF PARTICIPATION", CERT_WIDTH / 2, 360);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = "#94A3B8";
  ctx.font = "italic 26px 'Georgia', serif";
  ctx.fillText("This is proudly presented to", CERT_WIDTH / 2, 440);

  // Recipient Name in large highlight
  const nameGrad = ctx.createLinearGradient(0, 0, CERT_WIDTH, 0);
  nameGrad.addColorStop(0.3, "#38BDF8");
  nameGrad.addColorStop(0.5, "#FCD34D");
  nameGrad.addColorStop(0.7, "#34D399");
  ctx.fillStyle = nameGrad;
  ctx.font = "bold 72px 'Inter', sans-serif";
  ctx.shadowColor = "rgba(252, 211, 77, 0.3)";
  ctx.shadowBlur = 25;
  ctx.fillText(cert.recipientName ? cert.recipientName.toUpperCase() : "STUDENT NAME", CERT_WIDTH / 2, 540);
  ctx.shadowBlur = 0;

  // Academic Roll No & Branch
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "600 28px 'Inter', sans-serif";
  const rollText = [
    cert.recipientRollNo ? `Roll No: ${cert.recipientRollNo}` : "",
    cert.recipientBranch ? `Branch: ${cert.recipientBranch}` : "",
  ]
    .filter(Boolean)
    .join("   •   ");
  if (rollText) {
    ctx.fillText(rollText, CERT_WIDTH / 2, 610);
  }

  // Body Description Text
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "24px 'Inter', sans-serif";
  const eventName = cert.eventTitle || cert.eventId?.title || "Git Connect";
  const desc1 = `for successfully participating in the hands-on workshop on Git & GitHub during`;
  const desc2 = `${eventName.trim()} organized by Developer Student Club (DSC) RTU Kota.`;
  ctx.fillText(desc1, CERT_WIDTH / 2, 680);
  ctx.fillText(desc2, CERT_WIDTH / 2, 720);

  // Divider Line
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CERT_WIDTH / 2 - 250, 770);
  ctx.lineTo(CERT_WIDTH / 2 + 250, 770);
  ctx.stroke();

  // Event Date & Issue Date
  const issueDateFormatted = new Date(cert.issueDate || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 22px 'Inter', sans-serif";
  ctx.fillText(`Event Date: October 22, 2026   |   Issued on: ${issueDateFormatted}`, CERT_WIDTH / 2, 820);

  // Dynamic Signatories Positioning (prevents any overlap with QR code)
  let sig1X = 420;
  let sig2X = 1040;
  if (qrPosition === "bottom-left") {
    sig1X = 960;
    sig2X = 1560;
  } else if (qrPosition === "bottom-center") {
    sig1X = 380;
    sig2X = 1620;
  }
  const sigY = 1100;

  // Left Signatory (Club Lead)
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sig1X - 160, sigY);
  ctx.lineTo(sig1X + 160, sigY);
  ctx.stroke();

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 26px 'Inter', sans-serif";
  ctx.fillText("Sachin Sharma", sig1X, sigY + 40);
  ctx.fillStyle = "#38BDF8";
  ctx.font = "500 20px 'Inter', sans-serif";
  ctx.fillText("Club Lead, Developer Student Club", sig1X, sigY + 70);

  // Right Signatory (Faculty Advisor)
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sig2X - 160, sigY);
  ctx.lineTo(sig2X + 160, sigY);
  ctx.stroke();

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 26px 'Inter', sans-serif";
  ctx.fillText("Dr. Dinesh Birla", sig2X, sigY + 40);
  ctx.fillStyle = "#38BDF8";
  ctx.font = "500 20px 'Inter', sans-serif";
  ctx.fillText("Faculty Advisor, DSC RTU", sig2X, sigY + 70);

  ctx.restore();

  // Draw QR Code Card
  drawQrBadge(ctx, qrImg, cert.certificateId, qrPosition);
};

/**
 * Helper to draw rounded rectangle on canvas
 */
const roundRect = (ctx, x, y, width, height, radius, fill, stroke) => {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = { tl: 0, tr: 0, br: 0, bl: 0, ...radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
};

/**
 * Downloads canvas as high-resolution PNG
 */
export const downloadCertificatePNG = (canvas, fileName = "Certificate.png") => {
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads canvas as Landscape A4 PDF
 */
export const downloadCertificatePDF = (canvas, fileName = "Certificate.pdf") => {
  if (!canvas) return;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // A4 Landscape dimensions in mm: 297 x 210
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
  pdf.save(fileName);
};
