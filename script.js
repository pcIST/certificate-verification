const form = document.getElementById("verification-form");
const certificateInput = document.getElementById("certificate-id");
const resultContainer = document.getElementById("verification-result");

let certificates = [];

// Load certificate records
async function loadCertificates() {
    try {
        const response = await fetch("data/certificates.json");

        if (!response.ok) {
            throw new Error("Could not load certificate database.");
        }

        certificates = await response.json();
    } catch (error) {
        console.error("Certificate database error:", error);

        showSystemError(
            "The verification database could not be loaded. Please try again later."
        );
    }
}


// Normalize Certificate ID
function normalizeCertificateId(id) {
    return id.trim().toUpperCase();
}


// Find certificate
function findCertificate(id) {
    const normalizedId = normalizeCertificateId(id);

    return certificates.find(
        certificate =>
            normalizeCertificateId(certificate.certificate_id) === normalizedId
    );
}


// Format issue date
function formatDate(dateString) {
    if (!dateString) {
        return "Not specified";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}


// Show valid certificate
function showValidCertificate(certificate) {
    resultContainer.style.display = "block";

    resultContainer.innerHTML = `
        <div style="
            border: 1px solid #b8dec9;
            border-left: 5px solid #16834b;
            background: #f4fbf7;
            padding: 22px;
            border-radius: 8px;
        ">

            <div style="
                color: #16834b;
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 18px;
            ">
                ✓ Verified Certificate
            </div>

            <div style="line-height: 1.8; font-size: 14px;">

                <div>
                    <strong>Student:</strong>
                    ${escapeHtml(certificate.student_name)}
                </div>

                <div>
                    <strong>Course:</strong>
                    ${escapeHtml(certificate.course)}
                </div>

                <div>
                    <strong>Certificate ID:</strong>
                    ${escapeHtml(certificate.certificate_id)}
                </div>

                <div>
                    <strong>Issue Date:</strong>
                    ${formatDate(certificate.issue_date)}
                </div>

                <div>
                    <strong>Issued by:</strong>
                    ${escapeHtml(certificate.issuer)}
                </div>

                <div>
                    <strong>Institution:</strong>
                    ${escapeHtml(certificate.institution)}
                </div>

            </div>

        </div>
    `;
}


// Show revoked certificate
function showRevokedCertificate(certificate) {
    resultContainer.style.display = "block";

    resultContainer.innerHTML = `
        <div style="
            border: 1px solid #efc3c3;
            border-left: 5px solid #c43b3b;
            background: #fff7f7;
            padding: 22px;
            border-radius: 8px;
        ">

            <div style="
                color: #c43b3b;
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 10px;
            ">
                Certificate Revoked
            </div>

            <div style="font-size: 14px; line-height: 1.6;">
                Certificate ID
                <strong>${escapeHtml(certificate.certificate_id)}</strong>
                exists in the PcIST certificate registry but is no longer valid.
            </div>

        </div>
    `;
}


// Show certificate not found
function showNotFound(id) {
    resultContainer.style.display = "block";

    resultContainer.innerHTML = `
        <div style="
            border: 1px solid #efc3c3;
            border-left: 5px solid #c43b3b;
            background: #fff7f7;
            padding: 22px;
            border-radius: 8px;
        ">

            <div style="
                color: #c43b3b;
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 10px;
            ">
                Certificate Not Found
            </div>

            <div style="font-size: 14px; line-height: 1.6;">
                No certificate matching
                <strong>${escapeHtml(id)}</strong>
                was found in the official PcIST certificate registry.
            </div>

        </div>
    `;
}


// System/database error
function showSystemError(message) {
    resultContainer.style.display = "block";

    resultContainer.innerHTML = `
        <div style="
            border: 1px solid #efd6a4;
            border-left: 5px solid #c99324;
            background: #fffaf0;
            padding: 22px;
            border-radius: 8px;
        ">
            ${escapeHtml(message)}
        </div>
    `;
}


// Prevent HTML injection from certificate data
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


// Main verification
function verifyCertificate(id) {
    const normalizedId = normalizeCertificateId(id);

    if (!normalizedId) {
        return;
    }

    certificateInput.value = normalizedId;

    const certificate = findCertificate(normalizedId);

    if (!certificate) {
        showNotFound(normalizedId);
        return;
    }

    if (certificate.status?.toLowerCase() === "revoked") {
        showRevokedCertificate(certificate);
        return;
    }

    if (certificate.status?.toLowerCase() === "valid") {
        showValidCertificate(certificate);
        return;
    }

    showSystemError(
        "This certificate record has an unknown verification status."
    );
}


// Manual verification
form.addEventListener("submit", event => {
    event.preventDefault();

    verifyCertificate(certificateInput.value);
});


// Start application
async function initializeVerification() {
    await loadCertificates();

    // Read Certificate ID from QR URL:
    // ?id=PCIST-DSAI-2026-001

    const params = new URLSearchParams(window.location.search);
    const certificateId = params.get("id");

    if (certificateId) {
        verifyCertificate(certificateId);
    }
}

initializeVerification();