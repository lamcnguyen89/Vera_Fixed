export interface IVimeoState {
  connected: boolean;
  token: string;
  videos: Array<any>;
  loading: boolean;
  client: any;
}

export interface IVimeoVideo {
    app: {
        name: string;
        uri: string;
    };
    categories: Array<any>;
    content_rating: Array<string>;
    created_time: string;
    description: string;
    duration: string; // number?
    embed: {
        badges: {
            hdr: boolean;
            live: {
                archived: boolean;
                streaming: boolean;
            };
            staff_pick: {
                best_of_the_month: boolean;
                best_of_the_year: boolean;
                normal: boolean;
                premiere: boolean;
            };
            vod: boolean;
            weekend_challenge: boolean;
        };
        buttons: {
            embed: boolean;
            fullscreen: boolean;
            hd: boolean;
            like: boolean;
            scaling: boolean;
            share: boolean;
            watchlater: boolean;
        };
        color: string;
        html: string; // iframe here
        logos: {
            custom: {
                active: boolean;
                link: null | string;
                sticky: boolean;
            };
            vimeo: boolean;
        };
        playbar: boolean;
        speed: boolean;
        title: {
            name: string;
            owner: string;
            portrait: string;
        };
        uri: string | null;
        volume: boolean;
    };
    height: string; // number?
    language: null | string;
    last_user_action_event_date: null | string;
    license: string | null;
    link: string;
    metadata: {
        connections: any;
        interactions: any;
    };
    modified_time: string;
    name: string;
    parent_folder: null | string;
    pictures: {
        active: boolean;
        resource_key: string;
        sizes: Array<{
            height: string;// number?
            link: string;
            link_with_play_button: string;
            width: string;
        }>;
        type: string;
        uri: string;
    };
    privacy: {
        add: boolean;
        comments: string;
        download: boolean;
        embed: string;
        view: string;
    };
    release_time: string;
    resource_key: string;
    review_page: {
        active: boolean;
        link: string;
    };
    stats: {
        plays: string; // number?
    };
    status: string;
    tags: Array<string>;
    transcode: {
        status: string;
    };
    type: string;
    upload: {
        approach: any;
        complete_uri: any;
        form: any;
        link: any;
        redirect_url: any;
        size: any;
        status: string;
        upload_link: any;
    };
    uri: string;
    user: {
        account: string;
        bio: null | string;
        content_filter: Array<string>;
        created_time: string;
        link: string;
        location: string;
        metadata: {
            connections: any;
        };
        name: string;
        pictures: {
            active: boolean;
            resource_key: string;
            sizes: Array<{
                height: string; // number?
                link: string;
                width: string; // number?
            }>;
            type: string;
            uri: null | string;
        };
        preferences: {
            videos: {
                privacy: {
                    add: boolean;
                    comments: string;
                    download: boolean;
                    embed: string;
                    view: string;
                };
            };
        };
        resource_key: string;
        short_bio: null | string;
        upload_quota: {
            lifetime: {
                free: string; // number?
                max: string; // number?
                used: string; // number?
            };
            periodic: {
                free: string; // number?
                max: string; // number?
                used: string; // number?
                reset_date: string;
            };
            space: {
                free: string; // number?
                max: string; // number?
                used: string; // number?
                showing: string;
            };
        };
        uri: string;
        websites: Array<any>;
        width: string; // number?
    };
}
