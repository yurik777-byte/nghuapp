# Room Database
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao interface * { *; }
-keep class ru.nghu.timetable.data.local.** { *; }

# Retrofit 2 & OkHttp
-dontwarn retrofit2.**
-dontwarn okhttp3.**
-keep class retrofit2.** { *; }
-keepattributes Signature, Exceptions
-keepclasseswithmembers interface * {
    @retrofit2.http.* <methods>;
}

# Kotlinx Serialization
-keepattributes *Annotation*,InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class ru.nghu.timetable.data.remote.dto.** { *; }
-keep,includedescriptorclasses class ru.nghu.timetable.domain.model.** { *; }
# PDFBox-Android
-keep class com.tom_roush.pdfbox.** { *; }
-dontwarn com.tom_roush.pdfbox.**
-dontwarn org.bouncycastle.**

# Jsoup
-keep class org.jsoup.** { *; }
-dontwarn org.jsoup.**