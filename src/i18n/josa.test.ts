import { describe, it, expect } from 'vitest';
import { resolveJosa } from './josa';

describe('resolveJosa', () => {
  it('picks the 받침 form after a closed syllable', () => {
    expect(resolveJosa('계산을(를) 시작')).toBe('계산을 시작');
    expect(resolveJosa('연결이(가) 끊김')).toBe('연결이 끊김');
  });

  it('picks the open form after an open syllable', () => {
    expect(resolveJosa('네트워크을(를) 현재 사용할 수 없습니다')).toBe(
      '네트워크를 현재 사용할 수 없습니다',
    );
    expect(resolveJosa('컴퓨트은(는) 준비됨')).toBe('컴퓨트는 준비됨');
    expect(resolveJosa('네트워크과(와) 컴퓨트')).toBe('네트워크와 컴퓨트');
  });

  it('keeps the hedge after non-Hangul characters', () => {
    expect(resolveJosa("'NetworkApp'을(를) 불러왔습니다")).toBe(
      "'NetworkApp'을(를) 불러왔습니다",
    );
    expect(resolveJosa('3을(를) 입력')).toBe('3을(를) 입력');
  });

  it('resolves multiple hedges independently', () => {
    expect(resolveJosa('네트워크을(를) 열고 컴퓨트을(를) 닫음')).toBe('네트워크를 열고 컴퓨트를 닫음');
  });

  it('is a no-op for strings without hedges (e.g. English)', () => {
    expect(resolveJosa('Network is currently unavailable')).toBe(
      'Network is currently unavailable',
    );
    expect(resolveJosa('')).toBe('');
  });
});
