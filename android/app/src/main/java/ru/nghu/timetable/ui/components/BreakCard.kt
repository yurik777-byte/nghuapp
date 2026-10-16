package ru.nghu.timetable.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Coffee
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.WarningAmber
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ru.nghu.timetable.domain.model.BuildingType
import ru.nghu.timetable.domain.model.Lesson

/**
 * Break Card placed between consecutive lessons.
 * Highlights campus transition when previous and next lessons are in different buildings.
 */
@Composable
fun BreakCard(
    previousLesson: Lesson,
    nextLesson: Lesson,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    val isCampusSwitch = isBuildingTransition(previousLesson, nextLesson)
    val durationMinutes = calculateBreakDurationMinutes(previousLesson.timeEnd, nextLesson.timeStart)

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCampusSwitch) {
                if (isDark) Color(0xFF231E19) else Color(0xFFFFF7ED)
            } else {
                if (isDark) Color(0xFF181A20) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
            }
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = if (isCampusSwitch) {
                if (isDark) Color(0xFF4A3822) else Color(0xFFFDBA74)
            } else {
                if (isDark) Color(0xFF2A2D37) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)
            }
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            // Header Row: Break Time Range & Duration
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(
                                if (isCampusSwitch) {
                                    if (isDark) Color(0xFF7C2D12) else Color(0xFFFFEDD5)
                                } else {
                                    MaterialTheme.colorScheme.secondaryContainer
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isCampusSwitch) Icons.Default.DirectionsWalk else Icons.Default.Coffee,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = if (isCampusSwitch) {
                                if (isDark) Color(0xFFFB923C) else Color(0xFFEA580C)
                            } else {
                                MaterialTheme.colorScheme.secondary
                            }
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = if (durationMinutes >= 35) "Р‘РѕР»СЊС€Р°СЏ РїРµСЂРµРјРµРЅР° ($durationMinutes РјРёРЅ)" else "РџРµСЂРµРјРµРЅР° $durationMinutes РјРёРЅ",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = if (isCampusSwitch) {
                            if (isDark) Color(0xFFFDBA74) else Color(0xFFC2410C)
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        }
                    )
                }

                Text(
                    text = "${previousLesson.timeEnd} - ${nextLesson.timeStart}",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Campus Switch Alert Banner
            if (isCampusSwitch) {
                Spacer(modifier = Modifier.height(8.dp))

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isDark) Color(0xFF431407) else Color(0xFFFEF3C7),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isDark) Color(0xFF7C2D12) else Color(0xFFFDE68A)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.WarningAmber,
                            contentDescription = "Р’РЅРёРјР°РЅРёРµ",
                            modifier = Modifier
                                .size(18.dp)
                                .padding(top = 1.dp),
                            tint = if (isDark) Color(0xFFFBBF24) else Color(0xFFD97706)
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Column {
                            Text(
                                text = "РЎРјРµРЅР° РєРѕСЂРїСѓСЃР°!",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = if (isDark) Color(0xFFFEF3C7) else Color(0xFF92400E)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${previousLesson.building.shortTitle} (${previousLesson.building.address}) вћ” " +
                                    "${nextLesson.building.shortTitle} (${nextLesson.building.address})",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 12.sp
                                ),
                                color = if (isDark) Color(0xFFFFEDD5) else Color(0xFF78350F)
                            )
                            Text(
                                text = "РџРµС€РєРѕРј ~15-20 РјРёРЅСѓС‚ С‡РµСЂРµР· СѓР». РЎРїР°СЂС‚Р°РєР°",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (isDark) Color(0xFFFDBA74) else Color(0xFFB45309)
                            )
                        }
                    }
                }
            }
        }
    }
}

