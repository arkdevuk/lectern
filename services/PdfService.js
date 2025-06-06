const puppeteer = require('puppeteer');
const HtmlManipulationService = require('./HtmlManipulationService');

class PdfService {
    constructor() {
        this.browser = null;
        this.closeBrowserTimer = null;
        this.browserTimeout = 300000; // 5 minutes
        this.lock = Promise.resolve(); // Initial unlocked state
    }

    async getBrowser() {
        const minimal_args = [
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            "--disable-gpu",
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
            '--font-render-hinting=none',
        ];

        if (!this.browser) {
            try {
                this.browser = await puppeteer.launch({
                    headless: true,
                    args: minimal_args,
                });

                this.browser.on('disconnected', () => {
                    console.warn('⚠️ Puppeteer browser disconnected');
                    this.browser = null;
                });

                console.log('✅ Puppeteer browser initialized');
            } catch (err) {
                console.error('❌ Puppeteer launch failed:', err);
                throw err;
            }
        }

        if (this.closeBrowserTimer) {
            clearTimeout(this.closeBrowserTimer);
        }

        this.closeBrowserTimer = setTimeout(() => this.closeBrowser(), this.browserTimeout);

        return this.browser;
    }

    /**
     * Render an HTML fragment as a full page, inlining CSS and images.
     * @param {string} html - The full HTML document or snippet.
     * @param className
     * @param margins
     * @returns {Promise<string>} - The resulting HTML string with inlined CSS and images.
     */
    async renderHtmlFragment({ html }, className = 'html-fragment', margins = {}) {
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

            await page.emulateMediaType('screen');
            await page.waitForFunction('document.fonts.ready');

            // Add className to body
            await page.evaluate((className) => {
                document.body.classList.add(className);
            }, className);

            // Extract the whole document content HTML
            let content = await page.evaluate(() => {
                return document.documentElement.outerHTML;
            });

            content = HtmlManipulationService.inlineImgResources(content, className, margins)

            return content;
        } finally {
            await page.close();
        }
    }




    async generatePdf({
                          html,
                          headerHtml,
                          footerHtml,
                          options = {},
                          headerMargin = {},
                          footerMargin = {},
    }) {
        this.lock = this.lock.then(async () => {
            const browser = await this.getBrowser();
            const page = await browser.newPage();

            // if env == 'development', enable devtools
            /*
            if( process.env.NODE_ENV === 'development') {
                await page.on('console', msg => console.log('PAGE LOG:', msg.text()));
                await page.on('pageerror', err => console.error('PAGE ERROR:', err));
                page.on('requestfailed', req => {
                    console.error('REQUEST FAILED:', req.url(), req.failure());
                });
                // also log successful requests
                page.on('requestfinished', req => {
                    console.log('REQUEST FINISHED:', req.url());
                });
            }//*/



            if(headerHtml) {
                headerHtml = await this.renderHtmlFragment({html: headerHtml}, 'header-elementa', headerMargin); // Update headerHtml with the rendered content
            }

            if(footerHtml) {
                footerHtml = await this.renderHtmlFragment({ html: footerHtml }, 'footer-elementa', footerMargin);
            }


            try {
                await page.setContent(html, { waitUntil: 'networkidle2', timeout: 60000 });

                await page.emulateMediaType('screen');
                await page.waitForFunction('document.fonts.ready');

                const pdfOptions = {
                    format: 'A4',
                    printBackground: true,
                    displayHeaderFooter: true,
                    headerTemplate: headerHtml || '<div></div>',
                    footerTemplate: footerHtml || '<div></div>',
                    margin: { top: '100px', bottom: '50px', left: '35px', right: '35px' },
                    ...options,
                };

                const pdfBuffer = await page.pdf(pdfOptions);

                return pdfBuffer;
            } catch (err) {
                console.error('❌ PDF generation failed:', err);
                throw err;
            } finally {
                await page.close();
            }
        });

        return this.lock;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('✅ Puppeteer browser closed due to inactivity');
        }
    }
}

module.exports = new PdfService();
