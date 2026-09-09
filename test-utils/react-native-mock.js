// Minimal react-native stand-in so the component can be rendered with
// react-test-renderer without pulling in the full RN toolchain.
module.exports = {
    View: 'View',
    ScrollView: 'ScrollView',
    StyleSheet: {
        create: (styles) => styles,
        flatten: (style) => Object.assign({}, ...[].concat(style).filter(Boolean)),
    },
    useWindowDimensions: () => ({ width: 360, height: 640, scale: 2, fontScale: 1 }),
    Dimensions: { get: () => ({ width: 360, height: 640, scale: 2, fontScale: 1 }) },
};
