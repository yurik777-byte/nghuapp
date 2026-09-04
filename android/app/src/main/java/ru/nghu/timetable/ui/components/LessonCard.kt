package ru.nghu.timetable.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MeetingRoom
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.domain.model.LessonStatus
import ru.nghu.timetable.ui.theme.getBuildingBadgeColors
import ru.nghu.timetable.ui.theme.getCategoryColorScheme
import ru.nghu.timetable.ui.theme.getLessonStatusColors

/**
 * Modern "Campus"-styled Lesson Card displaying detailed pair information,
 * category accent indicator, teacher avatar, room, and campus building badges.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LessonCard(
    lesson: Lesson,
    modifier: Modifier = Modifier,
    status: LessonStatus? = null,
    onClick: (() -> Unit)? = null
) {
    val isDark = isSystemInDarkTheme()
    val resolvedStatus = status ?: lesson.getStatus()
    val categoryColors = getCategoryColorScheme(lesson.category, isDark)
    val buildingColors = getBuildingBadgeColors(lesson.building, isDark)
    val statusColors = getLessonStatusColors(resolvedStatus, isDark)

    val cardBorderColor = if (resolvedStatus == LessonStatus.ACTIVE) {
        statusColors.indicatorColor
    } else {
        MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
    }

    val cardElevation = if (resolvedStatus == LessonStatus.ACTIVE) 3.dp else 1.dp

    Card(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (resolvedStatus == LessonStatus.FINISHED) {
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
            } else {
                MaterialTheme.colorScheme.surface
            }
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = cardElevation),
        border = androidx.compose.foundation.BorderStroke(
            width = if (resolvedStatus == LessonStatus.ACTIVE) 1.5.dp else 1.dp,
            color = cardBorderColor
        )
    ) {
        Row(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Left Accent Color Bar corresponding to Subject Category
            Box(
                modifier = Modifier
                    .width(6.dp)
                    .fillMaxHeight(fraction = 1f)
                    .background(categoryColors.accentColor)
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp)
            ) {
                // Header: Pair Number, Time Interval, and Status Badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Pair Number Chip
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer,
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Text(
                                text = "${lesson.pairNumber} пара",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        // Time Interval
                        Text(
                            text = lesson.formattedTime,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Status Indicator
                    StatusBadge(status = resolvedStatus)
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Subject Title
                Text(
                    text = lesson.subject,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        lineHeight = 22.sp
                    ),
                    color = if (resolvedStatus == LessonStatus.FINISHED) {
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f)
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    },
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Category Tag Chip
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = categoryColors.containerColor
                ) {
                    Text(
                        text = lesson.category.title,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                        color = categoryColors.contentColor,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Teacher Info with Avatar Initials
                if (lesson.teacher.isNotBlank()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        TeacherAvatar(
                            teacherName = lesson.teacher,
                            modifier = Modifier.size(28.dp)
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Text(
                            text = lesson.teacher,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                }

                // Location Badges (Room + Campus Building)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Room Badge
                    if (lesson.room.isNotBlank()) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            border = androidx.compose.foundation.BorderStroke(
                                width = 1.dp,
                                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.MeetingRoom,
                                    contentDescription = "Аудитория",
                                    modifier = Modifier.size(15.dp),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (lesson.room.lowercase().contains("ауд") ||
                                        lesson.room.lowercase().contains("зал")
                                    ) {
                                        lesson.room
                                    } else {
                                        "ауд. ${lesson.room}"
                                    },
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    // Campus Building Badge (Distinct Spartaka vs Main)
                    BuildingBadge(
                        building = lesson.building,
                        buildingAddress = lesson.buildingAddress,
                        buildingColors = buildingColors
                    )
                }
            }
        }
    }
}

/**
 * Status badge with dot and text (e.g. "Идёт сейчас").
 */
@Composable
fun StatusBadge(
    status: LessonStatus,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    val colors = getLessonStatusColors(status, isDark)

    when (status) {
        LessonStatus.ACTIVE -> {
            Surface(
                modifier = modifier,
                shape = RoundedCornerShape(12.dp),
                color = colors.containerColor
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(colors.indicatorColor)
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = "Идёт сейчас",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = colors.contentColor
                    )
                }
            }
        }
        LessonStatus.UPCOMING -> {
            Row(
                modifier = modifier,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(colors.indicatorColor)
                )
            }
        }
        LessonStatus.FINISHED -> {
            Row(
                modifier = modifier,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .border(1.dp, colors.indicatorColor, CircleShape)
                )
            }
        }
    }
}

/**
 * Distinct Campus Building Badge.
 * Highlights Spartaka campus with vibrant amber/orange and Main campus with slate/blue.
 */
@Composable
fun BuildingBadge(
    building: BuildingType,
    buildingAddress: String,
    buildingColors: ru.nghu.timetable.ui.theme.BuildingBadgeColors,
    modifier: Modifier = Modifier
) {
    val displayText = when (building) {
        BuildingType.SPARTAKA -> "Спартака (Спартака, 12)"
        BuildingType.MAIN -> "Главный (Красный пр-т, 9)"
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = buildingColors.containerColor,
        border = androidx.compose.foundation.BorderStroke(1.dp, buildingColors.borderColor)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Icon(
                imageVector = Icons.Default.LocationOn,
                contentDescription = "Корпус",
                modifier = Modifier.size(15.dp),
                tint = buildingColors.accentColor
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = displayText,
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                color = buildingColors.contentColor
            )
        }
    }
}

/**
 * Circular avatar displaying teacher's initials.
 */
@Composable
fun TeacherAvatar(
    teacherName: String,
    modifier: Modifier = Modifier
) {
    val initials = extractInitials(teacherName)

    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = MaterialTheme.colorScheme.primaryContainer,
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
        )
    ) {
        Box(
            contentAlignment = Alignment.Center
        ) {
            if (initials.isNotBlank()) {
                Text(
                    text = initials,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    ),
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Преподаватель",
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
    }
}

