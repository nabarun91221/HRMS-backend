import path from "node:path";
import PDFDocument from "pdfkit";

export const generatePayrollPDF = async (payroll, res) => {
  // console.log(payroll)

  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=salary-slip-${payroll.month}-${payroll.year}.pdf`,
  );
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

  doc.pipe(res);

  const pageWidth = doc.page.width;

  // =========================
  // LOGO
  // =========================
  try {
    const logoPath = path.join(process.cwd(), "public/image/logo.jpg");
    doc.image(logoPath, 40, 40, { width: 55 });
  } catch {}

  // =========================
  // COMPANY HEADER
  // =========================
  doc.font("Helvetica-Bold").fontSize(20).text("N.M CAROLINA", 110, 45);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text("Payroll Department", 110, 70)
    .text("Salary Slip", 110, 85);

  doc
    .moveTo(40, 120)
    .lineTo(pageWidth - 40, 120)
    .stroke();

  // =========================
  // EMPLOYEE INFO GRID
  // =========================

  const emp = payroll.employeeId;

  const employeeName = `${emp?.personalInfo?.firstName || ""} ${emp?.personalInfo?.lastName || ""}`;

  const infoTop = 140;

  const cellHeight = 25;
  const colWidth = (pageWidth - 80) / 2;

  const drawCell = (text, x, y, width) => {
    doc.rect(x, y, width, cellHeight).stroke();
    doc.fontSize(10).text(text, x + 5, y + 8);
  };

  drawCell(`Employee Name: ${employeeName}`, 40, infoTop, colWidth);
  drawCell(
    `Employee Code: ${emp?.employeeCode || "-"}`,
    40 + colWidth,
    infoTop,
    colWidth,
  );

  drawCell(
    `Department: ${emp?.employment?.departmentId?.name || "-"}`,
    40,
    infoTop + cellHeight,
    colWidth,
  );
  drawCell(
    `Designation: ${emp?.employment?.designationId?.name || "-"}`,
    40 + colWidth,
    infoTop + cellHeight,
    colWidth,
  );

  drawCell(
    `Payroll Month: ${payroll.month}/${payroll.year}`,
    40,
    infoTop + cellHeight * 2,
    colWidth,
  );
  drawCell(
    `Generated: ${new Date().toLocaleDateString()}`,
    40 + colWidth,
    infoTop + cellHeight * 2,
    colWidth,
  );

  // =========================
  // TABLE HEADER
  // =========================

  const tableTop = infoTop + cellHeight * 3 + 40;

  const col1 = 40;
  const col2 = 260;
  const col3 = 350;
  const col4 = 510;

  const headerHeight = 25;

  // header background
  doc
    .rect(col1, tableTop, pageWidth - 80, headerHeight)
    .fillAndStroke("#e8f0fe", "#000");

  doc.fillColor("#000").font("Helvetica-Bold").fontSize(11);

  doc.text("EARNINGS", col1 + 10, tableTop + 7);
  doc.text("AMOUNT", col2 + 10, tableTop + 7);

  doc.text("DEDUCTIONS", col3 + 10, tableTop + 7);
  doc.text("AMOUNT", col4 - 10, tableTop + 7);

  // =========================
  // TABLE ROWS
  // =========================

  const maxRows = Math.max(payroll.earnings.length, payroll.deductions.length);

  let y = tableTop + headerHeight;

  for (let i = 0; i < maxRows; i++) {
    const earning = payroll.earnings[i];
    const deduction = payroll.deductions[i];

    doc.rect(col1, y, pageWidth - 80, 22).stroke();

    if (earning) {
      doc.font("Helvetica").fontSize(10);
      doc.text(earning.name, col1 + 10, y + 6);
      doc.text(`₹ ${earning.amount}`, col2 + 10, y + 6);
    }

    if (deduction) {
      doc.text(deduction.name, col3 + 10, y + 6);
      doc.text(`₹ ${deduction.amount}`, col4 - 10, y + 6);
    }

    y += 22;
  }

  // =========================
  // TOTAL SECTION
  // =========================

  const summaryTop = y + 20;

  const summaryWidth = 250;

  doc
    .rect(pageWidth - summaryWidth - 40, summaryTop, summaryWidth, 75)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(11);

  doc.text("Gross Salary:", pageWidth - 260, summaryTop + 10);
  doc.text(`₹ ${payroll.grossSalary}`, pageWidth - 140, summaryTop + 10);

  doc.text("Total Deductions:", pageWidth - 260, summaryTop + 30);
  doc.text(`₹ ${payroll.totalDeductions}`, pageWidth - 140, summaryTop + 30);

  doc.fontSize(13).text("Net Salary:", pageWidth - 260, summaryTop + 50);

  doc
    .font("Helvetica-Bold")
    .text(`₹ ${payroll.netSalary}`, pageWidth - 140, summaryTop + 50);

  // =========================
  // FOOTER
  // =========================

  const footerTop = doc.page.height - 70;

  doc
    .moveTo(40, footerTop)
    .lineTo(pageWidth - 40, footerTop)
    .stroke();

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This is a system generated salary slip and does not require signature.",
      40,
      footerTop + 10,
      { align: "center" },
    );

  doc.end();
};
