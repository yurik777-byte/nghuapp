package ru.nghu.timetable.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ru.nghu.timetable.domain.model.DaySchedule
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

/**
 * Data representation for a single day tab in the [DaySelector].
 */
data class DayTabItem(
    val date: String,             // "2026-09-04"
    val dayOfWeekShort: String,   // "Пт"
    val dayOfMonth: String,       // "4"
    val isToday: Boolean,
    val hasLessons: Boolean = true,
    val lessonCount: Int = 0
)

/**
 * Horizontal scrolling Day Selector with "Today" indicator and Campus styling.
 */
@Composable
fun DaySelector(
    days: List<DayTabItem>,
    selectedDate: String,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()

    // Auto-scroll to selected date on initial composition or change
    LaunchedEffect(selectedDate, days) {
        val selectedIndex = days.indexOfFirst { it.date == selectedDate }
        if (selectedIndex >= 0) {
            listState.animateScrollToItem(selectedIndex)
        }
    }

    LazyRow(
        state = listState,
        modifier = modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(days, key = { it.date }) { tab ->
            DayTabPill(
                item = tab,
                isSelected = tab.date == selectedDate,
                onClick = { onDateSelected(tab.date) }
            )
        }
    }
}

/**
 * Individual day pill button.
 */
@Composable
fun DayTabPill(
    item: DayTabItem,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val containerColor = if (isSelected) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.surface
    }

    val textColor = if (isSelected) {
        MaterialTheme.colorScheme.onPrimary
    } else {
        MaterialTheme.colorScheme.onSurface
    }

    val subTextColor = if (isSelected) {
        MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }

    val borderColor = when {
        isSelected -> MaterialTheme.colorScheme.primary
        item.isToday -> MaterialTheme.colorScheme.primary.copy(alpha = 0.7f)
        else -> MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
    }

    Surface(
        modifier = modifier
            .width(58.dp)
            .height(76.dp)
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        color = containerColor,
        border = androidx.compose.foundation.BorderStroke(
            width = if (item.isToday && !isSelected) 1.5.dp else 1.dp,
            color = borderColor
        ),
        shadowElevation = if (isSelected) 3.dp else 0.dp
    ) {
        Column(
            modifier = Modifier
                .padding(vertical = 8.dp, horizontal = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Weekday Short Name (e.g., "Пт")
            Text(
                text = item.dayOfWeekShort.uppercase(),
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    letterSpacing = 0.4.sp
                ),
                color = subTextColor
            )

            // Day Number (e.g., "4")
            Text(
                text = item.dayOfMonth,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp
                ),
                color = textColor
            )

            // Bottom Indicator ("Сегодня" marker or lesson count dot)
            Box(
                modifier = Modifier.height(10.dp),
                contentAlignment = Alignment.Center
            ) {
                when {
                    item.isToday && !isSelected -> {
                        // "Сегодня" text or dot
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary)
                        )
                    }
                    item.hasLessons && !isSelected -> {
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.outline)
                        )
                    }
                    isSelected -> {
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.onPrimary)
                        )
                    }
                    else -> {
                        Spacer(modifier = Modifier.size(4.dp))
                    }
                }
            }
        }
    }
}

/**
 * Builds [DayTabItem] list from domain [DaySchedule] items or dates.
 */
fun buildDayTabs(
    daySchedules: List<DaySchedule>,
    todayDate: String? = null
): List<DayTabItem> {
    val today = todayDate ?: runCatching {
        LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
    }.getOrDefault("")

    return daySchedules.map { day ->
        val parsedDate = runCatching {
            LocalDate.parse(day.date)
        }.getOrNull()

        val shortDayOfWeek = parsedDate?.dayOfWeek?.getDisplayName(
            TextStyle.SHORT,
            Locale.forLanguageTag("ru")
        )?.replace(".", "")?.capitalizeFirst()
            ?: day.dayOfWeek.take(2)

        val dayOfMonth = parsedDate?.dayOfMonth?.toString()
            ?: day.date.takeLast(2).trimStart('0')

        DayTabItem(
            date = day.date,
            dayOfWeekShort = shortDayOfWeek,
            dayOfMonth = dayOfMonth,
            isToday = day.date == today,
            hasLessons = day.lessons.isNotEmpty(),
            lessonCount = day.lessons.size
        )
    }
}

private fun String.capitalizeFirst(): String {
    return replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.forLanguageTag("ru")) else it.toString() }
}
