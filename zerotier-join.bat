@echo off
set ZT_CLI=C:\ProgramData\ZeroTier\One\zerotier-one_x64.exe

if "%1"=="" (
    echo Usage: zerotier-join.bat ^<NETWORK_ID^>
    echo Example: zerotier-join.bat 1234567890abcdef
    echo.
    echo Current status:
    %ZT_CLI% -q status
    echo.
    echo Current networks:
    %ZT_CLI% -q listnetworks
    pause
    exit /b
)

echo Joining network %1...
%ZT_CLI% -q join %1
if %errorlevel% equ 0 (
    echo Joined successfully!
    echo Current networks:
    %ZT_CLI% -q listnetworks
) else (
    echo Failed to join network. Are you running as Administrator?
)
pause
