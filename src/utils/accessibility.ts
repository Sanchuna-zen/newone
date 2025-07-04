import { getContrastRatio as getA11yContrastRatio } from 'a11y-color-contrast-checker';

export function getContrastRatio(color1: string, color2: string): number {
    return getA11yContrastRatio(color1, color2);
}

export type Compliance = 'AA' | 'AAA' | 'Fail';

export function checkCompliance(ratio: number): Compliance {
    if (ratio >= 7.0) {
        return 'AAA';
    } else if (ratio >= 4.5) {
        return 'AA';
    } else {
        return 'Fail';
    }
}