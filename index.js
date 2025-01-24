import { accessSpreadsheet } from './spreadsheet.js';
import { sendDataToSiteForm, makeCalltouchRequestImport } from './integrations.js';

// Таймаут до получения новых данных из гугл-таблиц (в секундах)
const googleSheetsParseTimeout = 180;
// Таймаут до отправки данных поочередно (в секундах)
const sendDataTimeout = 60;

async function main() {
    var rowsToParse = [];

    try {
        rowsToParse.push(...await accessSpreadsheet());
        console.log('Got data from Google Sheets:');
        console.dir(rowsToParse);
    } catch (error) {
        console.error('Error in first Google Sheets call:\n' + error);
    }

    var parser = setInterval(async () => {
        try {
            rowsToParse.push(...await accessSpreadsheet());
            console.log('Got new data from Google Sheets!');
            console.dir(rowsToParse);
        } catch (error) {
            console.error('Error in Google Sheets call:\n' + error);
        }
    }, 1000 * googleSheetsParseTimeout);

    var sender = setInterval(async () => {
        if (rowsToParse.length) {
            const row = rowsToParse.shift();
            const success = true;

            try {
                await sendDataToSiteForm(row[1].replace(/^8/, '+7'));

                console.log('Successfully sended email to site');
            } catch (error) {
                console.error('Error occurred when sending email to site:\n' + error);
            }
            
            try {
                await makeCalltouchRequestImport({
                    reqNumber: Date.now(),
                    subject: process.env.APP_NAME,
                    reqURL: process.env.SITE_URL,
                    name: row[0],
                    phone: row[1],
                    email: row[2],
                    utmsource: row[3],
                    utmchannel: row[4],
                    utmcampaign: row[5],
                    utmterm: row[6]
                });

                console.log('Successfully sended data to calltouch');
                console.log('Data to send left:');
                console.dir(rowsToParse);
            } catch (error) {
                success = false;
                console.error('Error occurred when sending data to calltouch:\n' + error);
            }

            if (!success) {
                rowsToParse.unshift(row);
            }
        } else {
            console.warn('No new data to send to calltouch and site!');
        }
    }, 1000 * sendDataTimeout);
}

main();