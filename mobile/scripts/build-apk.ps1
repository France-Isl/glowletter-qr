# Установочный файл GlowLetter (.apk) для своего телефона, подписанный ключом
# загрузки. Спрашивает пароль от ключа и кладёт GlowLetter-<версия>.apk на рабочий стол.
# Перед установкой версию из Google Play нужно удалить: у неё подпись Google.

Set-Location "C:\Project\glowletter\mobile\android"
$version = (Select-String -Path "app\build.gradle" -Pattern 'versionName = "([^"]+)"').Matches[0].Groups[1].Value
Write-Host ""
Write-Host "Собираю установочный файл GlowLetter $version для телефона." -ForegroundColor Yellow
Write-Host "Введите пароль от ключа. Буквы на экране не видны — так и должно быть." -ForegroundColor Yellow
$secure = Read-Host "Пароль от ключа" -AsSecureString
$password = [System.Net.NetworkCredential]::new('', $secure).Password

$env:GLOWLETTER_RELEASE_KEYSTORE_PATH = "C:\Users\Wolf\GlowLetter-keys\glowletter-upload.jks"
$env:GLOWLETTER_RELEASE_KEY_ALIAS = "upload"
$env:GLOWLETTER_RELEASE_KEYSTORE_PASSWORD = $password
$env:GLOWLETTER_RELEASE_KEY_PASSWORD = $password
$env:NURPISMO_VERIFICATION_URL = "https://xzzngrquomyiglktroqi.supabase.co/functions/v1/google-play-verify"
$env:NURPISMO_CLOUD_PROJECT_NUMBER = "96836561934"

$apk = "app\build\outputs\apk\release\GlowLetter-$version.apk"
if (Test-Path $apk) { Remove-Item $apk -Force }

& .\gradlew.bat --no-daemon :app:assembleRelease
$built = ($LASTEXITCODE -eq 0) -and (Test-Path $apk)

Remove-Item Env:GLOWLETTER_RELEASE_KEYSTORE_PASSWORD, Env:GLOWLETTER_RELEASE_KEY_PASSWORD -ErrorAction SilentlyContinue
$password = $null
$secure = $null

Write-Host ""
if ($built) {
    Copy-Item $apk "$HOME\Desktop\GlowLetter-$version.apk" -Force
    Write-Host "Готово! На рабочем столе лежит файл GlowLetter-$version.apk" -ForegroundColor Green
} else {
    Write-Host "Сборка не получилась. Чаще всего это неверный пароль — запустите ещё раз." -ForegroundColor Red
}
Write-Host ""
Read-Host "Нажмите Enter, чтобы закрыть это окно"
