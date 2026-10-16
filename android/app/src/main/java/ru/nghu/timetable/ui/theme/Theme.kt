package ru.nghu.timetable.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = BrandPrimaryLight,
    onPrimary = BrandOnPrimaryLight,
    primaryContainer = BrandPrimaryContainerLight,
    onPrimaryContainer = BrandOnPrimaryContainerLight,

    secondary = BrandSecondaryLight,
    onSecondary = BrandOnSecondaryLight,
    secondaryContainer = BrandSecondaryContainerLight,
    onSecondaryContainer = BrandOnSecondaryContainerLight,

    tertiary = BrandTertiaryLight,
    onTertiary = BrandOnTertiaryLight,
    tertiaryContainer = BrandTertiaryContainerLight,
    onTertiaryContainer = BrandOnTertiaryContainerLight,

    background = BrandBackgroundLight,
    onBackground = BrandOnBackgroundLight,
    surface = BrandSurfaceLight,
    onSurface = BrandOnSurfaceLight,
    surfaceVariant = BrandSurfaceVariantLight,
    onSurfaceVariant = BrandOnSurfaceVariantLight,

    outline = BrandOutlineLight,
    outlineVariant = BrandOutlineVariantLight,

    error = BrandErrorLight,
    onError = BrandOnErrorLight,
    errorContainer = BrandErrorContainerLight,
    onErrorContainer = BrandOnErrorContainerLight
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF60A5FA),
    onPrimary = Color(0xFF0F172A),
    primaryContainer = Color(0xFF222632),
    onPrimaryContainer = Color(0xFF93C5FD),

    secondary = Color(0xFF94A3B8),
    onSecondary = Color(0xFF0F172A),
    secondaryContainer = Color(0xFF222632),
    onSecondaryContainer = Color(0xFFCBD5E1),

    tertiary = Color(0xFF34D399),
    onTertiary = Color(0xFF064E3B),
    tertiaryContainer = Color(0xFF1E2624),
    onTertiaryContainer = Color(0xFFD1FAE5),

    background = Color(0xFF0F1013),
    onBackground = Color(0xFFF3F4F6),
    surface = Color(0xFF16181E),
    onSurface = Color(0xFFF3F4F6),
    surfaceVariant = Color(0xFF20232B),
    onSurfaceVariant = Color(0xFF9CA3AF),

    outline = Color(0xFF292C36),
    outlineVariant = Color(0xFF333642),

    error = Color(0xFFF87171),
    onError = Color(0xFF450A0A),
    errorContainer = Color(0xFF371E22),
    onErrorContainer = Color(0xFFFECACA)
)

/**
 * NGHU Timetable Theme applying Material 3 design and unified Dark Graphite aesthetics.
 */
@Composable
fun NGHUTimetableTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}

/**
 * Short alias for NGHUTimetableTheme.
 */
@Composable
fun NghuTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    NGHUTimetableTheme(
        darkTheme = darkTheme,
        dynamicColor = dynamicColor,
        content = content
    )
}
