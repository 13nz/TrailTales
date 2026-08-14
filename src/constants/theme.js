import colors from './colors'
import spacing from './spacing'
import typography from './typography'

// centralizes reusable visual tokens so every part of the application follows the same design language

const theme = {
    colors,

    spacing,

    typography,

    radii: {
        sm: 6,
        md: 12,
        lg: 18,
        xl: 24,
    },

    // keeps elevation subtle so the interface feels editorial and natural rather than heavily layered
    shadows: {
        card: {
            shadowColor: colors.ink,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
        },

        elevated: {
            shadowColor: colors.ink,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 5,
        },
    },
}

export default theme