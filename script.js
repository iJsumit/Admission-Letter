// Path to static PDF in your project
const STATIC_PDF_PATH = './assets/pdfs/static-pages.pdf';

const previewContainer = document.getElementById('pdfPreviewContainer');
const previewFrame = document.getElementById('pdfPreview');
const downloadBtn = document.getElementById('downloadMergedPdf');
const previewBtn = document.getElementById('previewBtn');
const dynamicBtn = document.getElementById('dynamicBtn');

previewBtn.addEventListener('click', generateAndMergePdf);
// dynamicBtn.addEventListener('click', generateDynamicOnly);

async function generateDynamicOnly() {
    const bytes = await generateDynamicPageAsBytes();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

async function generateAndMergePdf() {
    const name = document.getElementById('name').value;
    try {
        const dynamicBytes = await generateDynamicPageAsBytes();
        const staticBytes = await fetch(STATIC_PDF_PATH)
            .then(res => res.ok ? res.arrayBuffer() : Promise.reject(res.statusText));

        const mergedBytes = await mergePDFs(dynamicBytes, staticBytes);
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        previewFrame.src = url;
        previewContainer.style.display = 'block';
        downloadBtn.onclick = () => downloadPDF(url, `Admission-Letter-${name}.pdf`);
    } catch (err) {
        console.error(err);
        alert('Error generating PDF. Check console for details.');
    }
}

function downloadPDF(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Returns today's date formatted as "DD Month YYYY"
 * e.g. "04 September 2025"
 */
function getCurrentDateLongFormat() {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function generateDynamicPageAsBytes() {
    return new Promise(async (resolve) => {
        const bAmount = parseFloat(document.getElementById('bAmount').value) || 0;
        const scholarship = parseFloat(document.getElementById('scholarship').value) || 0;
        const programFee = 50000; // update or make dynamic if needed

        const finalFee = programFee - scholarship;
        const gstAmount = finalFee * 0.18;
        const netFee = finalFee + gstAmount;
        const duePayment = netFee - bAmount;

        const data = {
            newDate: getCurrentDateLongFormat(),
            name: document.getElementById('name').value,
            bAmount: bAmount,
            scholarship: scholarship,
            finalFee: finalFee,
            gstAmount: gstAmount,
            netFee: netFee,
            duePayment: duePayment
        };

        console.log(data);
        // resolve(data);


        // Build HTML snippet
        const container = document.createElement('div');
        container.innerHTML = `
      <div id="pdf-content" class="pdf-page">
      <div class="watermark">SAMPLE</div>
        <img src="logo.png" alt="Logo" class="pdf-logo">
        <h1 class="pdf-title">ADMISSION LETTER</h1>
        <div class="address">
            <div>
                iJaipuria<br>
                1/3, Block 1, Plot No. 3<br>
                WHS Timber Market, near Mayapuri Chowk,<br>
                Kirti Nagar, New Delhi, Delhi 110015
            </div>
            <div><strong>Date: ${data.newDate}</strong></div>
        </div>
        <p>Dear ${data.name},</p>

        <p>We are pleased to grant you a provisional offer to join our Skilling program Al-Powered Data Analytics.
            Your commitment to personal excellence makes you stand out as someone who will thrive within our
            learning environment.</p>

        <p>This program is scheduled to start in October 2025. Until then, you will be learning via self paced
            courses, pre-reads & live master classes. We look forward to communicating with you on all aspects
            related to your upcoming learning journey and giving you the opportunity to get to know us better. Over
            the next few weeks, we will be in touch via email and phone.</p>

        <p>Please be informed that you are required to pay a block amount of INR ${data.bAmount}/- for registration and
            enrollment processing purposes. Fee payment indicates your unequivocal acceptance of the T&C and related
            details listed in this letter.</p>

        <p>We know you are excited about the journey ahead, and so are we! Congratulations and welcome to the world
            of chasing BIG dreams and career decisions. We look forward to having you join us soon.</p>

        <div class="signature">
            <p>Best Regards,<br>Team iJaipuria</p>
        </div>

        <div class="appendix-title">APPENDIX A</div>

        <table>
            <thead>
                <tr>
                    <th>Details</th>
                    <th>Amount (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Program Fee</td>
                    <td>50,000</td>
                </tr>
                <tr>
                    <td>Scholarship</td>
                    <td>${data.scholarship}</td>
                </tr>
                <tr>
                    <td>Final Program Fee (Exclusive GST)</td>
                    <td>${data.finalFee}</td>
                </tr>
                <tr>
                    <td>GST @18%</td>
                    <td>${data.gstAmount}</td>
                </tr>
                <tr>
                    <td><strong>Net Program Fee*</strong></td>
                    <td><strong>${data.netFee}</strong></td>
                </tr>
            </tbody>
        </table>



        <table>
            <thead>
                <tr>
                    <th>Payment Milestones (Self Payment)</th>
                    <th>Terms</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Registration Amount At the time of Enrollment</td>
                    <td>${data.bAmount}</td>
                </tr>
                <tr>
                    <td>Within 2-7 days from the date of enrolment or before the batch start date (whichever comes
                        earlier)</td>
                    <td>${data.duePayment}</td>
                </tr>
            </tbody>
        </table>

        <p class="footer-note">Please note that if any of the installments are missed by the learner, then the class
            and/or content access will be revoked.</p>
    </div>`;

        // Wait for fonts to be loaded before PDF generation
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        html2pdf().set({
            margin: 15,
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4' }
        }).from(container).outputPdf('arraybuffer').then(resolve);
    });
}

async function mergePDFs(dynamicBytes, staticBytes) {
    const mergedPdf = await PDFLib.PDFDocument.create();
    const dyn = await PDFLib.PDFDocument.load(dynamicBytes);
    const stat = await PDFLib.PDFDocument.load(staticBytes);

    // Add dynamic first page
    const [dynPage] = await mergedPdf.copyPages(dyn, [0]);
    mergedPdf.addPage(dynPage);

    // Add all static pages
    const pageCount = stat.getPageCount();
    const indices = Array.from({ length: pageCount }, (_, i) => i);
    const statPages = await mergedPdf.copyPages(stat, indices);
    statPages.forEach(p => mergedPdf.addPage(p));

    return mergedPdf.save();
}
