import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function accessSpreadsheet() {
    return new Promise(async resolve => {
        const rowsToParse = [];

        const jwt = new JWT({
            email: process.env.CLIENT_EMAIL,
            key: process.env.PRIVATE_KEY,
            scopes: [ process.env.SCOPE ],
        });

        const doc = new GoogleSpreadsheet(process.env.SPREADSHEET, jwt);

        await doc.loadInfo();

        const mainSheet = doc.sheetsByIndex[0];
        const parsedSheet = doc.sheetsByTitle[process.env.PARSED_SHEET_NAME];

        const rows = await mainSheet.getRows({ offset: 0 });

        if (!rows.length) {
            console.warn('No new rows to parse!');
            resolve([]);
            return;
        }

        rows.forEach(async row => {
            rowsToParse.push({
                data: [
                    row.get('Имя клиента') ?? 'No name provided',
                    row.get('Телефон')?.replace(/\D/g, '')
                                    .replace(/(^\d)(\d{3})(\d{3})(\d{2})(\d{2})/, (p1, p2, p3, p4, p5, p6) => `8 (${p3 ?? ''}) ${p4 ?? ''}-${p5 ?? ''}-${p6 ?? ''}`),
                    row.get('Email') ?? '',
                    row.get('UTM-Источник') ?? '',
                    row.get('UTM-Канал') ?? '',
                    row.get('UTM-Кампания') ?? '',
                    row.get('UTM-Запрос') ?? '',
                    new Date()
                ],
                sendedToSite: false,
                sendedToCalltouch: false
            });
        });

        await mainSheet.clearRows();
        await parsedSheet.addRows(
            rowsToParse.reduce((acc, el) => {
                acc.push(el.data);
                return acc;
            }, [])
        );

        resolve(rowsToParse);
    });
}