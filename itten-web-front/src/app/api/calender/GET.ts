import { ICAL_TIMESTAMP_FORMAT } from '@/app/utiles/calenderFormats';
import dayjs from 'dayjs';
import ical from 'ical-generator';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    if (request.method !== 'GET') {
        return new Response('Method Not Allowed', {
            headers: { Allow: 'GET' },
            status: 405,
        });
    }

    const searchParams = request.nextUrl.searchParams;

    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const summaryParam = searchParams.get('summary');
    const descriptionParam = searchParams.get('description');
    const locationParam = searchParams.get('location');
    const urlParam = searchParams.get('url');

    if (!startParam || !endParam || !summaryParam) {
        return new Response(JSON.stringify({ message: '必須パラメータが指定されていません' }), {
            status: 500,
        });
    }

    const filename = 'calendar.ics';

    console.log('startParam', startParam);
    console.log('endParam', endParam);
    const srartDate = dayjs(startParam, ICAL_TIMESTAMP_FORMAT);
    const endDate = dayjs(endParam, ICAL_TIMESTAMP_FORMAT);

    console.log('srartDate', srartDate.toDate());
    console.log('endDate', endDate.toDate());

    try {
        const calendar = ical({ name: 'my first iCal' });
        const startTime = srartDate.toDate();
        const endTime = endDate.toDate();
        calendar.createEvent({
            start: startTime,
            end: endTime,
            summary: summaryParam || 'イベント',
            description: descriptionParam,
            location: locationParam,
            url: urlParam,
        });

        return new Response(calendar.toString(), {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename=${filename}`,
            },
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 500 });
    }
}
