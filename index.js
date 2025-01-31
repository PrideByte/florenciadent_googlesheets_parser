import { accessSpreadsheet } from './spreadsheet.js';
import { sendDataToSiteForm, makeCalltouchRequestImport, sendMailTo } from './integrations.js';

// Таймаут до получения новых данных из гугл-таблиц (в секундах)
const googleSheetsParseTimeout = 60 * 10;
// Таймаут до отправки данных поочередно (в секундах)
const sendDataTimeout = 60;

async function main() {
    var rowsToParse = [];

    try {
        rowsToParse.push(...await accessSpreadsheet());
        console.log(`${new Date()}: Got data from Google Sheets:`);
        console.dir(rowsToParse);
    } catch (error) {
        console.error(`${new Date()}: Error in first Google Sheets call:\n`);
        console.log(error);
    }

   var parser = setInterval(async () => {
        try {
            rowsToParse.push(...await accessSpreadsheet());
            console.log(`${new Date()}: Got new data from Google Sheets`);
            console.log(`${new Date()}: Data left to send:`);
            console.dir(rowsToParse);
        } catch (error) {
            console.error(`${new Date()}: Error in Google Sheets call:\n`);
            console.log(error);
        }
    }, 1000 * googleSheetsParseTimeout);

    async function sender() {
        if (rowsToParse.length) {
            const row = rowsToParse.shift();
            const { data } = row;

            if ((process.env.SEND_TO_SITE == 1) && (!row.sendedToSite)) {
                try {
                    await sendDataToSiteForm(data[1].replace(/^8/, '+7'));

                    console.log(`${new Date()}: Email to site were successfully sent`);
                    row.sendedToSite = true;
                } catch (error) {
                    console.error(`${new Date()}: Error occurred when sending email to site:\n`);
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

                    console.log(`${new Date()}: Data to Calltouch were successfully sent`);
                    row.sendedToCalltouch = true;
                } catch (error) {
                    success = false;
                    console.error(`${new Date()}: Error occurred when sending data to calltouch:\n`);
                    console.log(error);
                    console.log(await error.json());
                }
            }

            if ((process.env.SEND_TO_EMAIL == 1) && (!row.sendedToEmail)) {
                try {
                    await sendMailTo({
                        reqURL: process.env.SITE_URL,
                        name: data[0],
                        phone: data[1],
                        email: data[2],
                        utmsource: data[3],
                        utmchannel: data[4],
                        utmcampaign: data[5],
                        utmterm: data[6]
                    });

                    console.log(`${new Date()}: Email sended successfully`);
                    row.sendedToEmail = true;
                } catch (error) {
                    console.error(`${new Date()}: Error occurred when sending email:\n`);
                    console.log(error);
                }
            }

            if (((process.env.SEND_TO_CALLTOUCH == 1) && (!row.sendedToCalltouch))
                || ((process.env.SEND_TO_SITE == 1) && (!row.sendedToSite))
                || ((process.env.SEND_TO_EMAIL == 1) && (!row.sendedToEmail))) {
                console.log(`${new Date()}: One of the actions did not complete. Return row into the queue!`);
                rowsToParse.unshift(row);
            }

            console.log(`${new Date()}: Data left to send:`);
            console.dir(rowsToParse);
        } else {
            console.log(`${new Date()}: No new data to send to calltouch and site!`);
        }

        setTimeout(sender, 1000 * sendDataTimeout);
    }
    setTimeout(sender, 1000 * sendDataTimeout);
}

main();