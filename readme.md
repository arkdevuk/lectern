# HTML to PDF Generation API

A Dockerized API service built with Node.js and Puppeteer to convert HTML (with support for external CSS, fonts, and headers/footers) into PDF.

---

## 🧾 Endpoint

### `POST /api/generate-pdf`

Generate a PDF file from the provided HTML content.

---

## 📥 Request Body

### Content-Type: `application/json`

| Field        | Type     | Required | Description                                                           |
| ------------ | -------- | -------- | --------------------------------------------------------------------- |
| `html`       | `string` | ✅ Yes    | Main HTML content to convert to PDF.                                  |
| `headerHtml` | `string` | ❌ No     | HTML fragment for PDF header. Can include inline CSS & base64 images. |
| `footerHtml` | `string` | ❌ No     | HTML fragment for PDF footer. Same limitations as header.             |
| `options`    | `object` | ❌ No     | [Puppeteer PDF options](https://pptr.dev/api/puppeteer.pdfoptions/).  |

### Example

```json
{
  "html": "<html><body><h1>Invoice</h1></body></html>",
  "headerHtml": "<div id='header'>My Header</div>",
  "footerHtml": "<div id='footer'><span class='pageNumber'></span></div>",
  "options": {
    "margin": { "top": "100px", "bottom": "50px" },
    "format": "A4",
    "printBackground": true
  }
}
```

---

## 📤 Response

Returns a generated PDF file stream.

### Headers

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
```

---

## 🧪 Testing Locally

Start the service:

```bash
docker-compose up
```

Send a test request:

```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d @sample-request.json --output result.pdf
```

---

## 📌 Notes

* Header/footer HTML: **Lectern handles the inlining of styles and images internally**, just send full HTML. (**No JavaScript allowed**).
* External fonts (e.g. Google Fonts) must be embedded **as base64 via `@font-face` inside CSS**.
* Supports custom page size, margin, orientation, and all other Puppeteer PDF options.

---

## 🧱 Tech Stack

* Node.js
* Express.js
* Puppeteer (headless Chromium)
* Docker
* Cheerio & Fetch (for inlining images/fonts)

---

## 🛡️ License

MIT
