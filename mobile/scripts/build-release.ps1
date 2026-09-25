# Сборка GlowLetter для Google Play. Спрашивает пароль от ключа загрузки,
# собирает подписанный файл .aab и кладёт его на рабочий стол.
# Пароль нигде не сохраняется: он живёт только в этом окне, пока идёт сборка.

Set-Location "C:\Project\glowletter\mobile\android"
$version = (Select-String -Path "app\build.gradle" -Pattern 'versionName = "([^"]+)"').Matches[0].Groups[1].Value
Write-Host ""
Write-Host "Собираю GlowLetter $version для Google Play." -ForegroundColor Yellow
Write-Host "Введите пароль от ключа. Буквы на экране не видны — так и должно быть." -ForegroundColor Yellow
$keystore = "C:\Users\Wolf\GlowLetter-keys\glowletter-upload.jks"
$keytool = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
# Пароль проверяется сразу через keytool (секунда вместо полуминутной сборки),
# и его можно ввести до трёх раз, не открывая окно заново.
$password = $null
for ($attempt = 1; $attempt -le 3; $attempt++) {
    $secure = Read-Host "Пароль от ключа" -AsSecureString
    $candidate = [System.Net.NetworkCredential]::new('', $secure).Password
    $secure = $null
    if (-not (Test-Path $keytool)) { $password = $candidate; break }
    $candidate | & $keytool -list -keystore $keystore 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $password = $candidate; break }
    $candidate = $null
    Write-Host ""
    Write-Host "Пароль не подошёл (попытка $attempt из 3). Проверьте раскладку клавиатуры — нужна английская — и Caps Lock." -ForegroundColor Red
}
if (-not $password) {
    Write-Host ""
    Write-Host "Три раза пароль не подошёл. Закройте окно и попробуйте позже или напишите Claude." -ForegroundColor Red
    Read-Host "Нажмите Enter, чтобы закрыть это окно"
    exit 1
}

$env:GLOWLETTER_RELEASE_KEYSTORE_PATH = $keystore
$env:GLOWLETTER_RELEASE_KEY_ALIAS = "upload"
$env:GLOWLETTER_RELEASE_KEYSTORE_PASSWORD = $password
$env:GLOWLETTER_RELEASE_KEY_PASSWORD = $password
$env:NURPISMO_VERIFICATION_URL = "https://xzzngrquomyiglktroqi.supabase.co/functions/v1/google-play-verify"
$env:NURPISMO_CLOUD_PROJECT_NUMBER = "96836561934"

# Старый файл убираем заранее, чтобы при неудаче не скопировать прошлую сборку.
$bundle = "app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $bundle) { Remove-Item $bundle -Force }

$apk = "app\build\outputs\apk\release\GlowLetter-$version.apk"
if (Test-Path $apk) { Remove-Item $apk -Force }

& .\gradlew.bat --no-daemon :app:bundleRelease :app:assembleRelease
$built = ($LASTEXITCODE -eq 0) -and (Test-Path $bundle) -and (Test-Path $apk)

Remove-Item Env:GLOWLETTER_RELEASE_KEYSTORE_PASSWORD, Env:GLOWLETTER_RELEASE_KEY_PASSWORD -ErrorAction SilentlyContinue
$password = $null
$secure = $null

Write-Host ""
if ($built) {
    $target = "$HOME\Desktop\GlowLetter-$version.aab"
    Copy-Item $bundle $target -Force
    Copy-Item $apk "$HOME\Desktop\GlowLetter-$version.apk" -Force
    Write-Host "Готово! На рабочем столе лежат GlowLetter-$version.aab (для Google Play) и GlowLetter-$version.apk (для телефона)" -ForegroundColor Green
    Write-Host "Его нужно перетащить в Play Console: Закрытое тестирование -> Создать выпуск." -ForegroundColor Green
} else {
    Write-Host "Сборка не получилась, хотя пароль подошёл. Покажите это окно Claude — дело в коде или в Android Studio." -ForegroundColor Red
}
Write-Host ""
Read-Host "Нажмите Enter, чтобы закрыть это окно"
