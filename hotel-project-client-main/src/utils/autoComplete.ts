import * as hangul from 'hangul-js';

/**
 * 자동완성 유틸 함수
 *
 *
 * @param items string[]
 * @param keyword string
 * @param maxResult number default = 5
 *
 * @returns string[]
 */

const autoComplete = (items: string[], keyword: string, maxResult: number = 5) => {
  if (!keyword) return [];
  const results = items.filter(
    (item) =>
      hangul.search(item.replace(/\s/g, ''), keyword.replace(/\s/g, '')) > -1 ||
      hangul.search(item, keyword) > -1,
  );

  return results.slice(0, maxResult);
};

export default autoComplete;
