// ----------------------------------------------------------------------------
// ファイル名      : DeviceInfo.js
// モジュール記号  : DEVICE / Device
// モジュール名    : デバイス情報 (SW101-COM-DEVICE) Source File
// 内容           : 現在のURL解析、対応するサイトデータノードの特定を行う
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 名称     : 現在のURL取得
 * 内容     : 現在のURLを取得する（クエリ文字列やハッシュを除去したもの）
 * @returns {string} URL
 */
export function Device_GetCurrentUrl() {
    const urlObject = new URL(window.location.href);

    return urlObject.origin + urlObject.pathname;
}

/**
 * 名称     : 現在ノード特定
 * 内容     : サイトデータから現在のURLに合致するノードを特定する
 * @param {Array} siteData - サイトデータの配列
 * @returns {Object|null} 合致したノード、または見つからない場合はnull
 */
export function DEVICE_ResolveCurrentNode(siteData) {
    // URLの末尾（例: mathematics.html）やフルパスで照合
    const currentUrl = Device_GetCurrentUrl();
    console.log('Current URL:', currentUrl);
    console.log(currentUrl.split('/').pop());

    // siteDataのurlと一致するものを探す（末尾一致などで柔軟に判定）
    //const currentNode = data.find(n => n.url && n.url === currentUrl);
    const DEVICE_CurrentNode = siteData.find(n => n.url && (n.url === currentUrl || n.url.endsWith(currentUrl.split('/').pop())));

    console.log('Current node:', DEVICE_CurrentNode);
    return DEVICE_CurrentNode || null;
}
