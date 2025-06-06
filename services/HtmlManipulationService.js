const fetch = require('node-fetch');
const cheerio = require('cheerio');

class HtmlManipulationService {

    constructor() {
    }

    async inlineImgResources(html, className = 'inline-resources', margins = {}) {
        const $ = cheerio.load(html);

        // Inline CSS from <link rel="stylesheet">
        const cssLinks = $('link[rel="stylesheet"]');
        for (let i = 0; i < cssLinks.length; i++) {
            const link = cssLinks[i];
            const href = $(link).attr('href');
            if (href) {
                try {
                    const resp = await fetch(href);
                    const css = await resp.text();
                    // Insert as <style> and remove link
                    $(link).replaceWith(`<style>${css}</style>`);
                } catch (e) {
                    // If fail, leave as is
                }
            }
        }

        // Inline images as base64
        const images = $('img');
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const src = $(img).attr('src');
            if (src && !src.startsWith('data:')) {
                try {
                    const resp = await fetch(src);
                    const buffer = await resp.buffer();
                    // Guess MIME type (basic)
                    let mime = 'image/png';
                    if (src.match(/\\.jpe?g$/i)) mime = 'image/jpeg';
                    else if (src.match(/\\.gif$/i)) mime = 'image/gif';
                    else if (src.match(/\\.svg$/i)) mime = 'image/svg+xml';
                    else if (src.match(/\\.webp$/i)) mime = 'image/webp';
                    $(img).attr('src', `data:${mime};base64,${buffer.toString('base64')}`);
                } catch (e) {
                    // If fail, leave as is
                }
            }
        }
        // Extract body style and add class to add it later to the div
        const bodyClasses = $('body').attr('class') || '';

        // styles
        let styles = '';
        //*
        $('style').each((i, el) => {
            styles += $(el).html() + '\\n';
        });//*/


        // Extract and wrap body content in a div
        const bodyHtml = $('body').length ? $('body').html() : $.root().html();
        return `<style>${styles}</style>\n<div class="${className} ${bodyClasses}">${bodyHtml}</div>`;
    }
}

module.exports = new HtmlManipulationService();
