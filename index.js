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
            console.log('Data left to send:');
            console.dir(rowsToParse);
        } catch (error) {
            console.error('Error in Google Sheets call:\n' + error);
        }
    }, 1000 * googleSheetsParseTimeout);

    var sender = setInterval(async () => {
        if (rowsToParse.length) {
            const row = rowsToParse.shift();
            const { data } = row;

            if ((process.env.SEND_TO_SITE == 1) && (!row.sendedToSite)) {
                try {
                    await sendDataToSiteForm(data[1].replace(/^8/, '+7'));

                    console.log('Successfully sended email to site');
                    row.sendedToSite = true;
                } catch (error) {
                    console.error('Error occurred when sending email to site:\n');
                    console.log(error);
                }
            }
            
            if ((process.env.SEND_TO_CALLTOUCH == 1) && (!row.sendedToCalltouch)) {
                try {
                    await makeCalltouchRequestImport({
                        reqNumber: Date.now(),
                        subject: process.env.APP_NAME,
                        reqURL: process.env.SITE_URL,
                        name: data[0],
                        phone: data[1],
                        email: data[2],
                        utmsource: data[3],
                        utmchannel: data[4],
                        utmcampaign: data[5],
                        utmterm: data[6]
                    });

                    console.log('Successfully sended data to calltouch');
                    console.log('Data left to send:');
                    console.dir(rowsToParse);
                    row.sendedToCalltouch = true;
                } catch (error) {
                    success = false;
                    console.error('Error occurred when sending data to calltouch:\n');
                    console.log(error);
                    console.log(await error.json());
                }
            }

            if ((!row.sendedToCalltouch) || (!row.sendedToSite)) {
                console.log('Return row into the stack!');
                rowsToParse.unshift(row);
            }
        } else {
            console.warn('No new data to send to calltouch and site!');
        }
    }, 1000 * sendDataTimeout);
}

main();