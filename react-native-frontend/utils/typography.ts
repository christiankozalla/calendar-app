import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        letterSpacing: -0.2,
    },
    h4: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 24,
        letterSpacing: -0.1,
    },
    h5: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
    },
    h6: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    // Variants
    h1Light: {
        fontSize: 32,
        fontWeight: '400',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h2Light: {
        fontSize: 24,
        fontWeight: '400',
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    small: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0,
    },
});