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

            console.log(response);
            if (response.status === 200) {
                resolve();
            } else {
                console.error(response);
                reject(response);
            }
        } catch (err) {
            console.error(err);
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

            console.log(response);
            if (response.status === 200) {
                resolve();
            } else {
                console.error(response);
                reject(response);
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}