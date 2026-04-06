const isPro = localStorage.getItem("proUser") === "true";
const paymentStarted = localStorage.getItem("paymentStarted") === "true";

function generateInvoice() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const service = document.getElementById("service").value;
    const amount = document.getElementById("amount").value;
    const errorMsg = document.getElementById("errorMsg");
    const invoiceNo = document.getElementById("invoiceNo").value;
    const date = document.getElementById("date").value;

    if (!from || !to || !service || !amount || !invoiceNo || !date) {
        errorMsg.style.display = "block";
        return;
    } else {
        errorMsg.style.display = "none";
    }

    // ✅ LOGO HANDLE
    const logoInput = document.getElementById("logo").files[0];
    let logoURL = "";

    if (logoInput && isPro) {
        logoURL = URL.createObjectURL(logoInput);
    }

    // ✅ SAVE CLIENT
    saveClient(from, to);

    const invoiceHTML = `
    <div style="text-align:left;">

        ${logoURL ? `<img src="${logoURL}" width="80"><br><br>` : ""}

        <div style="display:flex; justify-content:space-between;">
            <h2>INVOICE</h2>
            <div>
                <p><strong>Invoice No:</strong> ${invoiceNo}</p>
                <p><strong>Date:</strong> ${date}</p>
            </div>
        </div>

        <hr>

        <p><strong>From:</strong> ${from}</p>
        <p><strong>To:</strong> ${to}</p>

        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr style="background:#f2f2f2;">
                <th style="padding:8px; border:1px solid #ddd;">Service</th>
                <th style="padding:8px; border:1px solid #ddd;">Amount</th>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd;">${service}</td>
                <td style="padding:8px; border:1px solid #ddd;">₹${amount}</td>
            </tr>
        </table>

        <h3 style="text-align:right; margin-top:20px;">Total: ₹${amount}</h3>

        <p style="text-align:center; margin-top:20px;">
            Thank you for your business!
        </p>

       ${!isPro ? `
<p style="color:gray; font-size:12px; text-align:center;">
    Free version – Upgrade to remove watermark
</p>

<div style="text-align:center; margin-top:10px;">
    <button style="
        display:inline-block;
        width:auto;
        padding:6px 12px;
        font-size:12px;
        border-radius:6px;
        background:#28a745;
        color:white;
        border:none;
        cursor:pointer;
    " onclick="upgrade()">
        Upgrade ₹99
    </button>
</div>

${paymentStarted ? `
<div style="text-align:center; margin-top:10px;">
    <button onclick="activatePro()" style="
        padding:5px 10px;
    font-size:11px;
    border-radius:5px;
    background:#007bff;
    color:white;
    border:none;
    cursor:pointer;
    display:inline-block;
    width:auto;
    ">
        I have Paid – Enter Code
    </button>
</div>
` : ""}

` : ""}

      <button style="width:auto; padding:8px 16px; font-size:13px;"
    onclick="downloadPDF('${from}','${to}','${service}','${amount}','${invoiceNo}','${date}')">
    Download PDF
</button>

    </div>
`;

    document.getElementById("invoice").innerHTML = invoiceHTML;
    document.getElementById("invoice").style.display = "block";
}


// ✅ PDF DOWNLOAD
function downloadPDF(from, to, service, amount, invoiceNo, date) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("INVOICE", 20, 20);

    // Invoice details (top right style)
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceNo}`, 140, 20);
    doc.text(`Date: ${date}`, 140, 26);

    // From / To
    doc.setFontSize(12);
    doc.text(`From: ${from}`, 20, 40);
    doc.text(`To: ${to}`, 20, 50);

    // Table header
    doc.setFontSize(12);
    doc.text("Service", 20, 70);
    doc.text("Amount", 150, 70);

    doc.line(20, 72, 190, 72);

    // Table row
    doc.text(service, 20, 80);
    doc.text(`Rs. ${amount}`, 150, 80);

    doc.line(20, 85, 190, 85);

    // Total
    doc.setFontSize(14);
    doc.text(`Total: Rs. ${amount}`, 20, 100);

    // Thank you note
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Thank you for your business!", 20, 115);

    // Watermark
    doc.setTextColor(150);
    if (!isPro) {
        doc.text("Free version – Upgrade to remove watermark", 20, 130);
    }

    doc.save("invoice.pdf");
}

// ✅ SAVE CLIENT FUNCTION
function saveClient(from, to) {
    if (!isPro) return; // 🔥 Only Pro users

    const clients = JSON.parse(localStorage.getItem("clients")) || [];

    const exists = clients.some(c => c.to === to);

    if (!exists) {
        clients.push({ from, to });
        localStorage.setItem("clients", JSON.stringify(clients));
    }
}

// ✅ LOAD CLIENTS
function loadClients() {
    const clients = JSON.parse(localStorage.getItem("clients")) || [];
    const dropdown = document.getElementById("savedClients");

    if (!dropdown) return;

    dropdown.innerHTML = `<option>Select Saved Client</option>`;

    clients.forEach(client => {
        const option = document.createElement("option");
        option.text = client.to;
        option.value = JSON.stringify(client);
        dropdown.add(option);
    });
    if (clients.length > 0) {
        dropdown.style.display = "block";
    }
}

// ✅ AUTO-FILL CLIENT
document.addEventListener("DOMContentLoaded", function () {
    loadClients();

    // ✅ LOGO CONTROL
    const logoLabel = document.getElementById("logoLabel");
    const logoNote = document.getElementById("logoNote");
    const logoInput = document.getElementById("logo");

    if (logoLabel && logoNote && logoInput) {
        if (isPro) {
            logoLabel.innerText = "Upload Logo";
            logoNote.innerText = "";
            logoInput.disabled = false; // ✅ enable
        } else {
            logoLabel.innerText = "Upload Logo (Pro Feature)";
            logoNote.innerText = "Upgrade to Pro to use logo in invoice";
            logoInput.disabled = true; // ❌ disable
        }
    }

    // ✅ CLIENT DROPDOWN
    const dropdown = document.getElementById("savedClients");

    if (dropdown) {
        dropdown.addEventListener("change", function () {
            if (this.value === "Select Saved Client") return;

            const data = JSON.parse(this.value);
            document.getElementById("from").value = data.from;
            document.getElementById("to").value = data.to;
        });
    }
});
function upgrade() {
    const confirmPay = confirm("Pay ₹99 to unlock Pro version?");

    if (confirmPay) {
        // mark that user started payment
        localStorage.setItem("paymentStarted", "true");
        // 👉 Open WhatsApp with message
        window.open("https://wa.me/918137979025?text=Hi, I want to upgrade to Pro ₹99");
    }
}
function activatePro() {
    const code = prompt("Enter your Pro activation code:");

    const validCodes = [
        "INV-PR0-7821",
        "INV-PR0-1942",
        "INV-PR0-6638"
    ];

    if (validCodes.includes(code)) {
        localStorage.setItem("proUser", "true");
        alert("Pro Activated 🎉");
        location.reload();
    } else {
        alert("Invalid code ❌");
    }
}