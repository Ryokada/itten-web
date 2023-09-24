import jwt from 'jsonwebtoken';

/**
 * LINEIDトークン取得APIのレスポンスボディの型
 */
export type RequestAccessTokenResponse = {
    access_token: string;
    expires_in: string;
    refresh_token: string;
    id_token: string;
    scope: string;
    token_type: string;
};

/**
 * デコード済みLINEIDトークン
 */
export type LineIdToken = {
    /**
     * IDトークンの対象ユーザーID
     */
    sub: string;

    /**
     * チャネルID
     */
    aud: string;

    /**
     * IDトークンの有効期限（UNIXタイム）
     */
    exp: number;

    /**
     * IDトークンの生成時間（UNIXタイム）
     */
    iat: number;

    /**
     * ユーザーの表示名。
     */
    name: string;

    /**
     * ユーザープロフィールの画像URL。
     */
    picture: string;

    /**
     * ユーザー認証時間（UNIXタイム）。認可リクエストにmax_ageの値を指定しなかった場合は含まれません。
     */
    auth_time?: number;

    /**
     * 認可URLに指定したnonceの値。認可リクエストにnonceの値を指定しなかった場合は含まれません。
     */
    amr?: string[];

    /**
     * ユーザーのメールアドレス。認可リクエストにemailスコープを指定しなかった場合は含まれません。
     */
    email?: string;
};

/**
 * LINEの認証画面へのリンクURLを構築します。
 *
 * @param state LINEに渡す用の認証のCSRF対策用の文字列
 * @returns リンクURL文字列
 */
export const buildLineAuthLInkUrl = (state: string): string => {
    const lineClientId = process.env.NEXT_PUBLIC_LINE_CHANEL_ID;
    const lineCallbackUrl = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL;

    if (!lineClientId || !lineCallbackUrl) {
        throw new Error('LINE認証に必要な環境変数が設定されていません。');
    }

    let baseUrl = 'https://access.line.me/oauth2/v2.1/authorize';
    baseUrl += '?response_type=code';
    baseUrl += `&client_id=${lineClientId}`;
    baseUrl += `&redirect_uri=${encodeURI(lineCallbackUrl)}`;
    baseUrl += `&state=${state}`;
    baseUrl += '&scope=profile%20openid';
    baseUrl += '&bot_prompt=aggressive';

    return baseUrl;
};

const encodeForm = (data: { [key: string]: string }) => {
    return Object.keys(data)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
};

/**
 * LINE認証サーバーからのアクセストークを取得します
 *
 * @param code LINE認証コールバックで発行されるcode
 * @returns デコード済みLINEIDトークン
 */
export const requestAccessToken = async (code: string) => {
    const lineClientId = process.env.NEXT_PUBLIC_LINE_CHANEL_ID;
    const lineSecret = process.env.NEXT_PUBLIC_LINE_CHANEL_SECRET;
    const lineCallbackUrl = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL;

    if (!lineClientId || !lineCallbackUrl || !lineSecret) {
        throw new Error('LINE認証に必要な環境変数が設定されていません。');
    }

    const requestBody = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: encodeURI(lineCallbackUrl),
        client_id: lineClientId,
        client_secret: lineSecret,
    };
    const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodeForm(requestBody),
    });

    if (response.status !== 200) {
        console.error('LINE IDトークン取得APIでエラーが発生しました', response);
        throw new Error('LINE IDトークン取得APIでエラーが発生しました');
    }
    const responseData: RequestAccessTokenResponse = await response.json();
    // https://developers.line.biz/ja/docs/line-login/verify-id-token/
    return jwt.decode(responseData.id_token) as LineIdToken;
};
