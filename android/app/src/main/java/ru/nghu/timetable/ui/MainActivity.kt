package ru.nghu.timetable.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.MeetingRoom
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.MeetingRoom
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import ru.nghu.timetable.data.repository.ScheduleRepository
import ru.nghu.timetable.ui.screens.rooms.RoomsScreen
import ru.nghu.timetable.ui.screens.rooms.RoomsViewModel
import ru.nghu.timetable.ui.screens.schedule.ScheduleScreen
import ru.nghu.timetable.ui.screens.schedule.ScheduleViewModel
import ru.nghu.timetable.ui.screens.teachers.TeachersScreen
import ru.nghu.timetable.ui.screens.teachers.TeachersViewModel
import ru.nghu.timetable.ui.theme.NghuTheme

/**
 * Main application navigation tabs.
 */
enum class MainNavTab(
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    SCHEDULE(
        title = "Расписание",
        selectedIcon = Icons.Filled.DateRange,
        unselectedIcon = Icons.Outlined.DateRange
    ),
    ROOMS(
        title = "Аудитории",
        selectedIcon = Icons.Filled.MeetingRoom,
        unselectedIcon = Icons.Outlined.MeetingRoom
    ),
    TEACHERS(
        title = "Преподаватели",
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Outlined.Person
    )
}

/**
 * Main Activity hosting Jetpack Compose UI with Material 3 Bottom Navigation.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        PDFBoxResourceLoader.init(applicationContext)
        enableEdgeToEdge()

        val repository = ScheduleRepository.getInstance(applicationContext)

        setContent {
            NghuTheme {
                MainAppScaffold(repository = repository)
            }
        }
    }
}

/**
 * Top-level application scaffold hosting the 3 main screens and the bottom navigation bar.
 */
@Composable
fun MainAppScaffold(
    repository: ScheduleRepository,
    modifier: Modifier = Modifier
) {
    var selectedTabIndex by rememberSaveable { mutableIntStateOf(0) }
    val tabs = MainNavTab.entries

    // Intercept system Back press on secondary tabs to navigate back to Schedule (Tab 0)
    BackHandler(enabled = selectedTabIndex != 0) {
        selectedTabIndex = 0
    }

    // ViewModels with factory instantiation preserving state
    val scheduleViewModel: ScheduleViewModel = viewModel(
        factory = ScheduleViewModel.provideFactory(repository)
    )
    val roomsViewModel: RoomsViewModel = viewModel(
        factory = RoomsViewModel.provideFactory(repository)
    )
    val teachersViewModel: TeachersViewModel = viewModel(
        factory = TeachersViewModel.provideFactory(repository)
    )

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                tabs.forEachIndexed { index, tab ->
                    val isSelected = selectedTabIndex == index
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedTabIndex = index },
                        icon = {
                            Icon(
                                imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                                contentDescription = tab.title
                            )
                        },
                        label = {
                            Text(
                                text = tab.title,
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 11.sp
                                )
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Crossfade(
            targetState = selectedTabIndex,
            label = "tab_crossfade",
            modifier = Modifier.padding(innerPadding)
        ) { tabIndex ->
            when (tabIndex) {
                0 -> ScheduleScreen(
                    viewModel = scheduleViewModel,
                    modifier = Modifier.fillMaxSize()
                )
                1 -> RoomsScreen(
                    viewModel = roomsViewModel,
                    modifier = Modifier.fillMaxSize()
                )
                2 -> TeachersScreen(
                    viewModel = teachersViewModel,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}
