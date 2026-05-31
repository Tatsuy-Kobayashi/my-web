// ----------------------------------------------------------------------------
// ファイル名    : DeviceInfo.js
// 名称          : デバイス・URL情報取得
// 内容          : 現在のURL解析、対応するサイトデータノードの特定を行う
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 現在のURLを取得する（クエリ文字列やハッシュを除去したもの）
 * @returns {string} URL
 */
export function getCurrentUrl() {
    return window.location.href.split('?')[0].split('#')[0];
}

/**
 * サイトデータから現在のURLに合致するノードを特定する
 * @param {Array} siteData - サイトデータの配列
 * @returns {Object|null} 合致したノード、または見つからない場合はnull
 */
export function resolveCurrentNode(siteData) {
    // URLの末尾（例: mathematics.html）やフルパスで照合
    const currentUrl = getCurrentUrl();
    console.log('Current URL:', currentUrl);
    console.log(currentUrl.split('/').pop());

    // siteDataのurlと一致するものを探す（末尾一致などで柔軟に判定）
    //const currentNode = data.find(n => n.url && n.url === currentUrl);
    const currentNode = siteData.find(n => n.url && (n.url === currentUrl || n.url.endsWith(currentUrl.split('/').pop())));

    console.log('Current node:', currentNode);
    return currentNode || null;
}
