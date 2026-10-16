package ru.nghu.timetable.ui.theme

import androidx.compose.ui.graphics.Color
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.LessonStatus
import ru.nghu.timetable.domain.model.SubjectCategory

// ==========================================
// Brand Palette - "Campus" Modern Aesthetic
// ==========================================

// Light Theme Primary & Accents
val BrandPrimaryLight = Color(0xFF2563EB)         // Electric Royal Blue
val BrandOnPrimaryLight = Color(0xFFFFFFFF)
val BrandPrimaryContainerLight = Color(0xFFDBEAFE)
val BrandOnPrimaryContainerLight = Color(0xFF1E40AF)

val BrandSecondaryLight = Color(0xFF4F46E5)       // Indigo Accent
val BrandOnSecondaryLight = Color(0xFFFFFFFF)
val BrandSecondaryContainerLight = Color(0xFFE0E7FF)
val BrandOnSecondaryContainerLight = Color(0xFF3730A3)

val BrandTertiaryLight = Color(0xFF0D9488)        // Campus Teal
val BrandOnTertiaryLight = Color(0xFFFFFFFF)
val BrandTertiaryContainerLight = Color(0xFFCCFBF1)
val BrandOnTertiaryContainerLight = Color(0xFF115E59)

val BrandBackgroundLight = Color(0xFFF8FAFC)      // Cool Off-White
val BrandOnBackgroundLight = Color(0xFF0F172A)
val BrandSurfaceLight = Color(0xFFFFFFFF)
val BrandOnSurfaceLight = Color(0xFF0F172A)
val BrandSurfaceVariantLight = Color(0xFFF1F5F9)  // Subtle card background
val BrandOnSurfaceVariantLight = Color(0xFF475569)
val BrandOutlineLight = Color(0xFFE2E8F0)
val BrandOutlineVariantLight = Color(0xFFCBD5E1)

// Dark Theme Primary & Accents (Unified Dark Graphite & Slate)
val BrandPrimaryDark = Color(0xFF93C5FD)          // Soft Muted Blue
val BrandOnPrimaryDark = Color(0xFF0F172A)
val BrandPrimaryContainerDark = Color(0xFF1E2638)
val BrandOnPrimaryContainerDark = Color(0xFFE2E8F0)

val BrandSecondaryDark = Color(0xFFA5B4FC)        // Soft Lavender Slate
val BrandOnSecondaryDark = Color(0xFF1E1B4B)
val BrandSecondaryContainerDark = Color(0xFF252836)
val BrandOnSecondaryContainerDark = Color(0xFFE2E8F0)

val BrandTertiaryDark = Color(0xFF6EE7B7)         // Soft Mint Sage
val BrandOnTertiaryDark = Color(0xFF064E3B)
val BrandTertiaryContainerDark = Color(0xFF1B2E28)
val BrandOnTertiaryContainerDark = Color(0xFFE2E8F0)

val BrandBackgroundDark = Color(0xFF111216)       // Deep Pure Dark Background
val BrandOnBackgroundDark = Color(0xFFF1F5F9)
val BrandSurfaceDark = Color(0xFF181A20)          // Clean Dark Graphite Card
val BrandOnSurfaceDark = Color(0xFFF1F5F9)
val BrandSurfaceVariantDark = Color(0xFF22242C)   // Elevated Slate Chip
val BrandOnSurfaceVariantDark = Color(0xFF94A3B8)
val BrandOutlineDark = Color(0xFF2A2D37)          // Subtle Card Border
val BrandOutlineVariantDark = Color(0xFF353844)

// Error Colors
val BrandErrorLight = Color(0xFFEF4444)
val BrandOnErrorLight = Color(0xFFFFFFFF)
val BrandErrorContainerLight = Color(0xFFFEE2E2)
val BrandOnErrorContainerLight = Color(0xFF991B1B)

val BrandErrorDark = Color(0xFFF87171)
val BrandOnErrorDark = Color(0xFF450A0A)
val BrandErrorContainerDark = Color(0xFF371E22)
val BrandOnErrorContainerDark = Color(0xFFFECACA)

// ==========================================
// Category Accent Colors (Calm & Refined)
// ==========================================

// PAINTING_DRAWING: Soft Lavender / Purple
val CategoryPaintingLightContainer = Color(0xFFF3E8FF)
val CategoryPaintingLightText = Color(0xFF6B21A8)
val CategoryPaintingLightAccent = Color(0xFF9333EA)
val CategoryPaintingDarkContainer = Color(0xFF22242D)
val CategoryPaintingDarkText = Color(0xFFE2E8F0)
val CategoryPaintingDarkAccent = Color(0xFFA78BFA)

// DESIGN_DIGITAL: Soft Steel Blue
val CategoryDesignLightContainer = Color(0xFFDBEAFE)
val CategoryDesignLightText = Color(0xFF1E40AF)
val CategoryDesignLightAccent = Color(0xFF2563EB)
val CategoryDesignDarkContainer = Color(0xFF20242E)
val CategoryDesignDarkText = Color(0xFFE2E8F0)
val CategoryDesignDarkAccent = Color(0xFF60A5FA)

// HUMANITIES: Soft Sage / Emerald
val CategoryHumanitiesLightContainer = Color(0xFFD1FAE5)
val CategoryHumanitiesLightText = Color(0xFF065F46)
val CategoryHumanitiesLightAccent = Color(0xFF059669)
val CategoryHumanitiesDarkContainer = Color(0xFF1E2624)
val CategoryHumanitiesDarkText = Color(0xFFE2E8F0)
val CategoryHumanitiesDarkAccent = Color(0xFF34D399)

// PHYSICAL: Soft Warm Honey
val CategoryPhysicalLightContainer = Color(0xFFFEF3C7)
val CategoryPhysicalLightText = Color(0xFF92400E)
val CategoryPhysicalLightAccent = Color(0xFFD97706)
val CategoryPhysicalDarkContainer = Color(0xFF26241F)
val CategoryPhysicalDarkText = Color(0xFFE2E8F0)
val CategoryPhysicalDarkAccent = Color(0xFFFBBF24)

// OTHER: Neutral Slate
val CategoryOtherLightContainer = Color(0xFFF1F5F9)
val CategoryOtherLightText = Color(0xFF334155)
val CategoryOtherLightAccent = Color(0xFF64748B)
val CategoryOtherDarkContainer = Color(0xFF22242C)
val CategoryOtherDarkText = Color(0xFFE2E8F0)
val CategoryOtherDarkAccent = Color(0xFF94A3B8)

// ==========================================
// Campus Building Differentiation
// ==========================================

// Main Campus (РљСЂР°СЃРЅС‹Р№ РїСЂ-С‚, 9): Muted Graphite Badge
val BuildingMainLightContainer = Color(0xFFE2E8F0)
val BuildingMainLightText = Color(0xFF334155)
val BuildingMainLightBorder = Color(0xFFCBD5E1)
val BuildingMainLightAccent = Color(0xFF475569)

val BuildingMainDarkContainer = Color(0xFF22242C)
val BuildingMainDarkText = Color(0xFFCBD5E1)
val BuildingMainDarkBorder = Color(0xFF2E323D)
val BuildingMainDarkAccent = Color(0xFF94A3B8)

// Spartaka Campus (СѓР». РЎРїР°СЂС‚Р°РєР°, 12): Subtle Warm Amber Badge
val BuildingSpartakaLightContainer = Color(0xFFFFEDD5)
val BuildingSpartakaLightText = Color(0xFF9A3412)
val BuildingSpartakaLightBorder = Color(0xFFFDBA74)
val BuildingSpartakaLightAccent = Color(0xFFEA580C)

val BuildingSpartakaDarkContainer = Color(0xFF282520)
val BuildingSpartakaDarkText = Color(0xFFFDE68A)
val BuildingSpartakaDarkBorder = Color(0xFF423B2E)
val BuildingSpartakaDarkAccent = Color(0xFFF59E0B)

// ==========================================
// Status Indicators (Live / Upcoming / Finished)
// ==========================================

val StatusActiveLight = Color(0xFF10B981)
val StatusActiveLightContainer = Color(0xFFD1FAE5)
val StatusActiveDark = Color(0xFF34D399)
val StatusActiveDarkContainer = Color(0xFF162822)

val StatusUpcomingLight = Color(0xFF3B82F6)
val StatusUpcomingLightContainer = Color(0xFFDBEAFE)
val StatusUpcomingDark = Color(0xFF94A3B8)
val StatusUpcomingDarkContainer = Color(0xFF22242C)

val StatusFinishedLight = Color(0xFF94A3B8)
val StatusFinishedLightContainer = Color(0xFFF1F5F9)
val StatusFinishedDark = Color(0xFF64748B)
val StatusFinishedDarkContainer = Color(0xFF181A20)

// ==========================================
// Color Helper Data Classes & Mappers
// ==========================================

data class CategoryColorScheme(
    val containerColor: Color,
    val contentColor: Color,
    val accentColor: Color
)

data class BuildingBadgeColors(
    val containerColor: Color,
    val contentColor: Color,
    val borderColor: Color,
    val accentColor: Color
)

data class StatusColors(
    val indicatorColor: Color,
    val containerColor: Color,
    val contentColor: Color
)

fun getCategoryColorScheme(category: SubjectCategory, isDark: Boolean = true): CategoryColorScheme {
    return if (isDark) {
        when (category) {
            SubjectCategory.PAINTING_DRAWING -> CategoryColorScheme(
                containerColor = CategoryPaintingDarkContainer,
                contentColor = CategoryPaintingDarkText,
                accentColor = CategoryPaintingDarkAccent
            )
            SubjectCategory.DESIGN_DIGITAL -> CategoryColorScheme(
                containerColor = CategoryDesignDarkContainer,
                contentColor = CategoryDesignDarkText,
                accentColor = CategoryDesignDarkAccent
            )
            SubjectCategory.HUMANITIES -> CategoryColorScheme(
                containerColor = CategoryHumanitiesDarkContainer,
                contentColor = CategoryHumanitiesDarkText,
                accentColor = CategoryHumanitiesDarkAccent
            )
            SubjectCategory.PHYSICAL -> CategoryColorScheme(
                containerColor = CategoryPhysicalDarkContainer,
                contentColor = CategoryPhysicalDarkText,
                accentColor = CategoryPhysicalDarkAccent
            )
            SubjectCategory.OTHER -> CategoryColorScheme(
                containerColor = CategoryOtherDarkContainer,
                contentColor = CategoryOtherDarkText,
                accentColor = CategoryOtherDarkAccent
            )
        }
    } else {
        when (category) {
            SubjectCategory.PAINTING_DRAWING -> CategoryColorScheme(
                containerColor = CategoryPaintingDarkContainer,
                contentColor = CategoryPaintingDarkText,
                accentColor = CategoryPaintingDarkAccent
            )
            SubjectCategory.DESIGN_DIGITAL -> CategoryColorScheme(
                containerColor = CategoryDesignDarkContainer,
                contentColor = CategoryDesignDarkText,
                accentColor = CategoryDesignDarkAccent
            )
            SubjectCategory.HUMANITIES -> CategoryColorScheme(
                containerColor = CategoryHumanitiesDarkContainer,
                contentColor = CategoryHumanitiesDarkText,
                accentColor = CategoryHumanitiesDarkAccent
            )
            SubjectCategory.PHYSICAL -> CategoryColorScheme(
                containerColor = CategoryPhysicalDarkContainer,
                contentColor = CategoryPhysicalDarkText,
                accentColor = CategoryPhysicalDarkAccent
            )
            SubjectCategory.OTHER -> CategoryColorScheme(
                containerColor = CategoryOtherDarkContainer,
                contentColor = CategoryOtherDarkText,
                accentColor = CategoryOtherDarkAccent
            )
        }
    }
}

fun getBuildingBadgeColors(building: BuildingType, isDark: Boolean = true): BuildingBadgeColors {
    return if (isDark) {
        when (building) {
            BuildingType.MAIN -> BuildingBadgeColors(
                containerColor = BuildingMainDarkContainer,
                contentColor = BuildingMainDarkText,
                borderColor = BuildingMainDarkBorder,
                accentColor = BuildingMainDarkAccent
            )
            BuildingType.SPARTAKA -> BuildingBadgeColors(
                containerColor = BuildingSpartakaDarkContainer,
                contentColor = BuildingSpartakaDarkText,
                borderColor = BuildingSpartakaDarkBorder,
                accentColor = BuildingSpartakaDarkAccent
            )
        }
    } else {
        when (building) {
            BuildingType.MAIN -> BuildingBadgeColors(
                containerColor = BuildingMainDarkContainer,
                contentColor = BuildingMainDarkText,
                borderColor = BuildingMainDarkBorder,
                accentColor = BuildingMainDarkAccent
            )
            BuildingType.SPARTAKA -> BuildingBadgeColors(
                containerColor = BuildingSpartakaDarkContainer,
                contentColor = BuildingSpartakaDarkText,
                borderColor = BuildingSpartakaDarkBorder,
                accentColor = BuildingSpartakaDarkAccent
            )
        }
    }
}

fun getLessonStatusColors(status: LessonStatus, isDark: Boolean = true): StatusColors {
    return when (status) {
        LessonStatus.ACTIVE -> StatusColors(
            indicatorColor = StatusActiveDark,
            containerColor = StatusActiveDarkContainer,
            contentColor = StatusActiveDark
        )
        LessonStatus.UPCOMING -> StatusColors(
            indicatorColor = StatusUpcomingDark,
            containerColor = StatusUpcomingDarkContainer,
            contentColor = StatusUpcomingDark
        )
        LessonStatus.FINISHED -> StatusColors(
            indicatorColor = StatusFinishedDark,
            containerColor = StatusFinishedDarkContainer,
            contentColor = StatusFinishedDark
        )
    }
}
