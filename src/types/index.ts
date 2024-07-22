type MsgType = "report_post" | "report_force" | "report_request" | "panel_open";

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

export type StorageType = "options";

export type StoredOptions = {
    [title: string]: boolean;
};
