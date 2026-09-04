package ru.nghu.timetable.ui.screens.schedule

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ru.nghu.timetable.domain.model.Lesson
import ru.nghu.timetable.ui.components.BreakCard
import ru.nghu.timetable.ui.components.DaySelector
import ru.nghu.timetable.ui.components.GroupPickerBottomSheet
import ru.nghu.timetable.ui.components.LessonCard
import ru.nghu.timetable.ui.components.LiveIndicator
import ru.nghu.timetable.ui.components.calculateBreakDurationMinutes
import ru.nghu.timetable.ui.components.isBuildingTransition

/**
 * Main Schedule Screen displaying group timetable, horizontal day selector,
 * real-time live indicator, and campus-styled pair cards.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScheduleScreen(
    viewModel: ScheduleViewModel,
    modifier: Modifier = Modifier,
    onLessonClicked: ((Lesson) -> Unit)? = null
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top App Header
        ScheduleTopHeader(
            selectedGroup = uiState.selectedGroup,
            isRefreshing = uiState.isRefreshing,
            onGroupClick = { viewModel.showGroupPicker() },
            onRefreshClick = { viewModel.refresh() }
        )

        // Offline Banner
        AnimatedVisibility(
            visible = uiState.isOffline,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            OfflineNoticeBanner(
                message = "Офлайн-режим • Отображаются сохранённые данные"
            )
        }

        // Horizontal Day Selector
        if (uiState.dayTabs.isNotEmpty()) {
            DaySelector(
                days = uiState.dayTabs,
                selectedDate = uiState.selectedDate,
                onDateSelected = { viewModel.selectDate(it) },
                modifier = Modifier.padding(vertical = 6.dp)
            )
        }

        // Schedule Content Area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            when {
                uiState.isLoading && uiState.days.isEmpty() -> {
                    // Initial Loading State
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(36.dp),
                                color = MaterialTheme.colorScheme.primary,
                                strokeWidth = 3.dp
                            )
                            Text(
                                text = "Загрузка расписания...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                uiState.days.isEmpty() && uiState.errorMessage != null -> {
                    // Error State with Retry
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.6f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CloudOff,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.size(40.dp)
                                )
                                Text(
                                    text = "Не удалось загрузить данные",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                                Text(
                                    text = uiState.errorMessage ?: "Проверьте подключение к сети",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onErrorContainer.copy(alpha = 0.8f),
                                    textAlign = TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.clickable { viewModel.refresh() }
                                ) {
                                    Text(
                                        text = "Повторить",
                                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onError,
                                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                else -> {
                    // Schedule list with LiveIndicator and Lessons
                    val lessons = uiState.currentDayLessons
                    val liveState = uiState.resolveCurrentLiveState()

                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Live Indicator (Active Lesson / Break)
                        item(key = "live_indicator") {
                            LiveIndicator(
                                state = liveState,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        if (lessons.isEmpty()) {
                            // Empty day state
                            item(key = "empty_day") {
                                EmptyDayCard()
                            }
                        } else {
                            // Lessons and breaks
                            itemsIndexed(
                                items = lessons,
                                key = { _, lesson -> lesson.id }
                            ) { index, lesson ->
                                // Break card between consecutive pairs
                                if (index > 0) {
                                    val previousLesson = lessons[index - 1]
                                    val breakDuration = calculateBreakDurationMinutes(previousLesson.timeEnd, lesson.timeStart)
                                    if (breakDuration > 0 || isBuildingTransition(previousLesson, lesson)) {
                                        BreakCard(
                                            previousLesson = previousLesson,
                                            nextLesson = lesson,
                                            modifier = Modifier.padding(vertical = 2.dp)
                                        )
                                    }
                                }

                                LessonCard(
                                    lesson = lesson,
                                    status = lesson.getStatus(),
                                    onClick = onLessonClicked?.let { { it(lesson) } }
                                )
                            }
                        }

                        // Bottom padding for scroll clearance
                        item(key = "bottom_spacer") {
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }
                }
            }
        }
    }

    // Group Picker Modal Bottom Sheet
    if (uiState.isGroupPickerVisible) {
        GroupPickerBottomSheet(
            groups = uiState.availableGroups,
            selectedGroup = uiState.selectedGroup,
            onGroupSelected = { selected ->
                viewModel.selectGroup(selected.name)
            },
            onDismissRequest = {
                viewModel.hideGroupPicker()
            }
        )
    }
}

/**
 * Top header containing app branding, selected group pill, and refresh button.
 */
@Composable
private fun ScheduleTopHeader(
    selectedGroup: String,
    isRefreshing: Boolean,
    onGroupClick: () -> Unit,
    onRefreshClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // App Title & Group Selector
        Column {
            Text(
                text = "НГХУ Расписание",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 21.sp
                ),
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Group selector chip / button
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier.clickable(onClick = onGroupClick)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.School,
                        contentDescription = "Группа",
                        modifier = Modifier.size(15.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Группа $selectedGroup",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.ExpandMore,
                        contentDescription = "Выбрать группу",
                        modifier = Modifier.size(17.dp),
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }

        // Action Buttons: Refresh
        IconButton(
            onClick = onRefreshClick,
            enabled = !isRefreshing
        ) {
            if (isRefreshing) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.primary
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Обновить расписание",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

/**
 * Notice banner displayed when operating offline with cached data.
 */
@Composable
private fun OfflineNoticeBanner(
    message: String,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFFFEF3C7),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFCD34D))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.CloudOff,
                contentDescription = null,
                tint = Color(0xFFB45309),
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                color = Color(0xFF78350F)
            )
        }
    }
}

/**
 * Empty day placeholder card with pleasant Campus aesthetics.
 */
@Composable
private fun EmptyDayCard(
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 24.dp),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Outlined.EventBusy,
                    contentDescription = null,
                    modifier = Modifier.size(28.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
            }

            Text(
                text = "На этот день пар нет",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = "Отличная возможность отдохнуть, посетить библиотеку или поработать над творческим проектом!",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}
