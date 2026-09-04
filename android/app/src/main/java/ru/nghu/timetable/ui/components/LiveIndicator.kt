package ru.nghu.timetable.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.ui.theme.getBuildingBadgeColors
import ru.nghu.timetable.ui.theme.getCategoryColorScheme
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlin.math.max
import kotlin.math.min


/**
 * Live Indicator Card showing active lesson or break progress.
 */
@Composable
fun LiveIndicator(
    state: LiveIndicatorState,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    val isDark = isSystemInDarkTheme()

    Card(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
            ),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = when (state) {
                is LiveIndicatorState.LessonActive -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.45f)
                is LiveIndicatorState.BreakActive -> MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f)
                else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            }
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = when (state) {
                is LiveIndicatorState.LessonActive -> MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                is LiveIndicatorState.BreakActive -> MaterialTheme.colorScheme.secondary.copy(alpha = 0.4f)
                else -> MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
            }
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            when (state) {
                is LiveIndicatorState.LessonActive -> {
                    ActiveLessonContent(
                        state = state,
                        isDark = isDark
                    )
                }

                is LiveIndicatorState.BreakActive -> {
                    ActiveBreakContent(
                        state = state,
                        isDark = isDark
                    )
                }

                is LiveIndicatorState.DayUpcoming -> {
                    UpcomingDayContent(
                        state = state,
                        isDark = isDark
                    )
                }

                is LiveIndicatorState.DayFinished -> {
                    SimpleStatusContent(
                        title = "Завершено",
                        subtitle = state.message,
                        icon = Icons.Default.CheckCircle,
                        tint = MaterialTheme.colorScheme.tertiary
                    )
                }

                is LiveIndicatorState.NoLessons -> {
                    SimpleStatusContent(
                        title = "Выходной день",
                        subtitle = state.message,
                        icon = Icons.Default.AccessTime,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun ActiveLessonContent(
    state: LiveIndicatorState.LessonActive,
    isDark: Boolean
) {
    val categoryColors = getCategoryColorScheme(state.lesson.category, isDark)
    val buildingColors = getBuildingBadgeColors(state.lesson.building, isDark)

    // Top Header Row with Pulsing Live Badge
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            PulsingDot(color = Color(0xFF10B981))
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "СЕЙЧАС ИДЁТ ПАРА",
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.8.sp
                ),
                color = if (isDark) Color(0xFF34D399) else Color(0xFF059669)
            )
        }

        Surface(
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(13.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Осталось ${state.minutesRemaining} мин",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Subject Title
    Text(
        text = state.lesson.subject,
        style = MaterialTheme.typography.titleMedium.copy(
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp
        ),
        color = MaterialTheme.colorScheme.onSurface,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
    )

    Spacer(modifier = Modifier.height(6.dp))

    // Room & Building & Time Info
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "${state.lesson.pairNumber} пара • ${state.lesson.formattedTime}",
            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        if (state.lesson.room.isNotBlank()) {
            Text(
                text = " • ауд. ${state.lesson.room}",
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
        }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Progress Bar with Percentage
    Column(modifier = Modifier.fillMaxWidth()) {
        LinearProgressIndicator(
            progress = { state.progress.coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant,
            strokeCap = StrokeCap.Round
        )

        Spacer(modifier = Modifier.height(4.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = state.lesson.timeStart,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "${(state.progress.coerceIn(0f, 1f) * 100).toInt()}%",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = state.lesson.timeEnd,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ActiveBreakContent(
    state: LiveIndicatorState.BreakActive,
    isDark: Boolean
) {
    // Header Row
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            PulsingDot(color = Color(0xFFF59E0B))
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "ПЕРЕМЕНА",
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.8.sp
                ),
                color = if (isDark) Color(0xFFFBBF24) else Color(0xFFD97706)
            )
        }

        Surface(
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(13.dp),
                    tint = MaterialTheme.colorScheme.secondary
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "До пары ${state.minutesRemaining} мин",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.secondary
                )
            }
        }
    }

    Spacer(modifier = Modifier.height(10.dp))

    Text(
        text = "Следующая: ${state.nextLesson.subject}",
        style = MaterialTheme.typography.titleMedium.copy(
            fontWeight = FontWeight.Bold,
            fontSize = 17.sp
        ),
        color = MaterialTheme.colorScheme.onSurface,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
    )

    Spacer(modifier = Modifier.height(4.dp))

    Text(
        text = "${state.nextLesson.pairNumber} пара в ${state.nextLesson.timeStart}" +
            if (state.nextLesson.room.isNotBlank()) " (ауд. ${state.nextLesson.room})" else "",
        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )

    // Campus Switch Warning Alert
    if (state.isCampusSwitch && state.previousLesson != null) {
        Spacer(modifier = Modifier.height(8.dp))
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isDark) Color(0xFF451A03) else Color(0xFFFEF3C7),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isDark) Color(0xFF92400E) else Color(0xFFFDE68A)
            )
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.DirectionsWalk,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = if (isDark) Color(0xFFFBBF24) else Color(0xFFB45309)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Переход между корпусами! (${state.previousLesson.building.shortTitle} ➔ ${state.nextLesson.building.shortTitle})",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = if (isDark) Color(0xFFFEF3C7) else Color(0xFF92400E)
                )
            }
        }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Break progress bar
    LinearProgressIndicator(
        progress = { state.progress.coerceIn(0f, 1f) },
        modifier = Modifier
            .fillMaxWidth()
            .height(6.dp)
            .clip(RoundedCornerShape(3.dp)),
        color = MaterialTheme.colorScheme.secondary,
        trackColor = MaterialTheme.colorScheme.surfaceVariant,
        strokeCap = StrokeCap.Round
    )
}

@Composable
private fun UpcomingDayContent(
    state: LiveIndicatorState.DayUpcoming,
    isDark: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.PlayCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column {
            Text(
                text = "До начала занятий: ${state.minutesUntilStart} мин",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "1-я пара: ${state.firstLesson.subject} в ${state.firstLesson.timeStart}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun SimpleStatusContent(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(tint.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(22.dp)
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PulsingDot(
    color: Color,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Box(
        modifier = modifier
            .size(10.dp)
            .clip(CircleShape)
            .background(color.copy(alpha = alpha))
    )
}

