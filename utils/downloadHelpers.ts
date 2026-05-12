import { Image } from 'react-native';

export type AssetLike = string | number | { uri?: string };

/**
 * RNのasset module（number/object）を実URLへ解決する。
 */
export function resolveAssetUri(asset: AssetLike): string {
  if (typeof asset === 'string') {
    return asset;
  }

  if (typeof asset === 'number') {
    const source = Image.resolveAssetSource(asset);
    if (source?.uri) {
      return source.uri;
    }
  }

  if (asset && typeof asset === 'object' && typeof asset.uri === 'string') {
    return asset.uri;
  }

  throw new Error('アセットURLの解決に失敗しました');
}

/**
 * WebでBlobを確実にダウンロードするための共通処理。
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  // 即時revokeすると一部ブラウザで保存前に解放される場合がある
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
