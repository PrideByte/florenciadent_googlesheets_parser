import nodemailer from 'nodemailer';

export async function sendDataToSiteForm(phoneNumber) {
    return new Promise(async (resolve, reject) => {
        const emailBody = {
            "mask-633": phoneNumber,
            "acceptance-71": 1
        };

        const form = new FormData();
        for (const field in emailBody) {
            form.append(field, emailBody[field]);
        }

        try {
            const response = await fetch(process.env.CF7_ENDPOINT, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "include",
                headers: {
                    'Accept': '*/*',
                    'Connection': 'keep-alive',
                    'User-Agent': process.env.APP_NAME,
                    "Authorization": process.env.SITE_AUTH
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: form,
            });

            if (response.status === 200) {
                resolve(response);
            } else {
                reject(response);
            }
        } catch (err) {
            reject(err);
        }
    });
}

export async function makeCalltouchRequestImport(data) {
    return new Promise(async (resolve, reject) => {
        const calltouchReqParams = {
            "requests": [
                {
                    "requestNumber": data.reqNumber,
                    "subject": data.subject,
                    "requestUrl": data.reqURL,
                    "phoneNumber": data.phone,
                    "email": data.email,
                    "fio": data.name,
                    "addTags": [
                        { "tag": "googleSheets" }
                    ],
                    "customSources": {
                        "source": data.utmsource,
                        "medium": data.utmchannel,
                        "campaign": data.utmcampaign,
                        "term": data.utmterm
                    }
                }
            ]
        }

        const formData = JSON.stringify(calltouchReqParams);

        try {
            const response = await fetch(process.env.CALLTOUCH_ENDPOINT, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "include",
                headers: {
                    'Accept': '*/*',
                    'Connection': 'keep-alive',
                    'User-Agent': process.env.APP_NAME,
                    'Access-Token': process.env.CALLTOUCH_TOKEN,
                    'SiteId': process.env.CALLTOUCH_SITEID,
                    'Content-Type': 'application/json'
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: formData,
            });

            if (response.status === 200) {
                resolve(response);
            } else {
                reject(response);
            }
        } catch (err) {
            reject(err);
        }
    });
}

export async function sendMailTo(data) {
    return new Promise(async (resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: +process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        try {
            const result = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_TO,
                subject: 'New data from Google Sheets parser',
                text: `Новые данные из Google Sheets.
                    Сайт: ${data.reqURL},\n
                    Телефон: ${data.phone},\n
                    email: ${data.email},\n
                    ФИО: ${data.name},\n
                    utm-источник: ${data.utmsource},\n
                    utm-канал: ${data.utmchannel},\n
                    utm-кампания: ${data.utmcampaign},\n
                    utm-запрос: ${data.utmterm}`,
                html: `Новые данные из Google Sheets.
                Сайт: ${data.reqURL},<br>
                Телефон: ${data.phone},<br>
                email: ${data.email},<br>
                ФИО: ${data.name},<br>
                utm-источник: ${data.utmsource},<br>
                utm-канал: ${data.utmchannel},<br>
                utm-кампания: ${data.utmcampaign},<br>
                utm-запрос: ${data.utmterm}`
            });

            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};