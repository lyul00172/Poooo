/**
 * 비속어 필터링 리스트
 * 여기에 필터링하고 싶은 단어를 직접 추가해 주세요.
 */
export const BAD_WORDS = [
  '씨바',
  '시발',
  '조까',
  '병신',
  '지랄',
  '좆까',
  '씨발',
  '씨발련아',
  '존나',
  '개새끼',
  '쌍년',
  '쌍놈',
  '개년',
  '개년아',
  '섹스',
  'ㅅㅅ',
  'ㅅㅂ',
  'ㅅㅂ련아',
  'ㄱㅅㄲ',
  '너임마청년',
  '병신아',
  '느금마',
  'ㄴㄱㅁ',
  '야발',
  '야스',
  '니애미',
  'fuck',
  'ass',
  'motherfucker',
  'son of a bitch',
  'wtf',
];

/**
 * 텍스트 내의 비속어를 찾아 '***'로 변환합니다.
 */
export function filterContent(content: string): string {
  let filtered = content;

  BAD_WORDS.forEach((word) => {
    // 대소문자 구분 없이 전역 검색을 위해 RegExp 사용
    // 특수문자가 포함될 경우를 대비해 escape 처리가 필요할 수 있으나, 단순 단어 위주로 구성
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, (match) => '*'.repeat(match.length));
  });

  return filtered;
}
