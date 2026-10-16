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
import ru.nghu.timetable.ui.theme.BuildingBadgeColors
import ru.nghu.timetable.ui.theme.getBuildingBadgeColors
import ru.nghu.timetable.ui.theme.getCategoryColorScheme
import ru.nghu.timetable.ui.theme.getLessonStatusColors

/**
 * Modern unified dark-graphite Lesson Card displaying detailed pair information,
 * teacher avatar, room, and campus building badges in the same dark style as the surroundings.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LessonCard(
    lesson: Lesson,
    modifier: Modifier = Modifier,
    status: LessonStatus? = null,
    onClick: (() -> Unit)? = null
) {
    val resolvedStatus = status ?: lesson.getStatus()

    val cardBorderColor = if (resolvedStatus == LessonStatus.ACTIVE) {
        Color(0xFF10B981)
    } else {
        Color(0xFF262933)
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (resolvedStatus == LessonStatus.FINISHED) {
                Color(0xFF14161C)
            } else {
                Color(0xFF16181E)
            }
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        border = androidx.compose.foundation.BorderStroke(
            width = if (resolvedStatus == LessonStatus.ACTIVE) 1.5.dp else 1.dp,
            color = cardBorderColor
        )
    ) {
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
                        color = Color(0xFF20232B),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2E323D)),
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Text(
                            text = "${lesson.pairNumber} пара",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = Color(0xFFE2E4E9),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    // Time Interval
                    Text(
                        text = lesson.formattedTime,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = Color(0xFF94A3B8)
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
                    Color(0xFF94A3B8)
                } else {
                    Color(0xFFFFFFFF)
                },
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Category Tag Chip (Dark Graphite Style)
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = Color(0xFF20232B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2E323D))
            ) {
                Text(
                    text = lesson.category.title,
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                    color = Color(0xFF94A3B8),
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
                        color = Color(0xFFE2E4E9),
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
                        color = Color(0xFF20232B),
                        border = androidx.compose.foundation.BorderStroke(
                            width = 1.dp,
                            color = Color(0xFF2E323D)
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
                                tint = Color(0xFF94A3B8)
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
                                color = Color(0xFFCBD5E1)
                            )
                        }
                    }
                }

                // Campus Building Badge
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF20232B),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = Color(0xFF2E323D)
                    )
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Корпус",
                            modifier = Modifier.size(15.dp),
                            tint = if (lesson.building == BuildingType.SPARTAKA) Color(0xFFF59E0B) else Color(0xFF94A3B8)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (lesson.buildingAddress.isNotBlank()) {
                                "${lesson.building.shortTitle} (${lesson.buildingAddress})"
                            } else {
                                "${lesson.building.shortTitle} (${lesson.building.address})"
                            },
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = Color(0xFFCBD5E1)
                        )
                    }
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
    when (status) {
        LessonStatus.ACTIVE -> {
            Surface(
                modifier = modifier,
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFF132D21),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E5B3D))
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF34D399))
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = "Идёт сейчас",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Color(0xFF34D399)
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
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF4B5563))
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
                        .size(6.dp)
                        .clip(CircleShape)
                        .border(1.dp, Color(0xFF4B5563), CircleShape)
                )
            }
        }
    }
}

/**
 * Distinct Campus Building Badge.
 */
@Composable
fun BuildingBadge(
    building: BuildingType,
    buildingAddress: String,
    buildingColors: BuildingBadgeColors,
    modifier: Modifier = Modifier
) {
    val displayText = if (buildingAddress.isNotBlank()) {
        "${building.shortTitle} ($buildingAddress)"
    } else {
        "${building.shortTitle} (${building.address})"
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = Color(0xFF20232B),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2E323D))
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Icon(
                imageVector = Icons.Default.LocationOn,
                contentDescription = "Корпус",
                modifier = Modifier.size(15.dp),
                tint = if (building == BuildingType.SPARTAKA) Color(0xFFF59E0B) else Color(0xFF94A3B8)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = displayText,
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                color = Color(0xFFCBD5E1)
            )
        }
    }
}

/**
 * Circular avatar displaying teacher's initials in dark graphite style.
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
        color = Color(0xFF252834),
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = Color(0xFF333745)
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
                    color = Color(0xFFCBD5E1)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Преподаватель",
                    modifier = Modifier.size(16.dp),
                    tint = Color(0xFF94A3B8)
                )
            }
        }
    }
}