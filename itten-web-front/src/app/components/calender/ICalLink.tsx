'use client';

import ical from 'ical-generator';

type ICalLinkProps = {
    start: Date;
    end: Date;
    summry: string;
    description?: string;
    location?: string;
    url?: string;
};

const ICalLink = ({ start, end, summry, description, location, url }: ICalLinkProps) => {
    const calendar = ical({ name: 'my first iCal' });
    calendar.createEvent({
        start: start,
        end: end,
        summary: summry,
        description: description ?? '',
        location: location,
        url: url,
    });

    return (
        <a href={calendar.toString()} download='calendar.ics'>
            Add to calendar
        </a>
    );
};

export default ICalLink;
