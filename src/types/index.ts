type MsgType = "report_post" | "report_request";

export type DairyReport = {
    team: string;
    place: string;
    id: {
        business: string;
        service: string;
    };
    content: {
        major: string;
        minor: string;
        detail: string | null;
    };
};

export type Msg<T> = {
    type: MsgType;
    data: T;
};
