const pdfService = require('../services/PdfService');

exports.generatePdf = (req, res) => {
    const { html, headerHtml, footerHtml, options, headerMargin, footerMargin } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'HTML content is required.' });
    }


    pdfService.generatePdf({ html, headerHtml, footerHtml, options, headerMargin, footerMargin })
        .then(pdfBuffer => {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=\"document.pdf\"',
            });
            res.send(pdfBuffer);
        })
        .catch(err => {
            console.error('PDF Generation error:', err);
            res.status(500).json({ error: 'Failed to generate PDF.' });
        });
};
