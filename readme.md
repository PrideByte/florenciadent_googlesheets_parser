## Предварительные требования
Установленная платформа [NodeJS](https://nodejs.org/en/download) с пакетным менеджером **npm**. Ссылка на [установщик](https://nodejs.org/dist/v23.6.1/node-v23.6.1-x64.msi) текущей версии 23.6.1.

Проверить установлены ли **NodeJS** и **NPM** можно с помощью консоли:
1) на операционной системе **Windows** открыть окно консоли можно нажав комбинацию клавиш **Win+R**, ввести *cmd* и нажать клавишу **Enter**.

![изображение](https://github.com/user-attachments/assets/89a66eff-0db3-4b4e-b3e1-7d5f9394a874)

2) Так же можно ввести *cmd* в поисковую строку и выбрать приложение **Командная строка** в результатах поиска.

![изображение](https://github.com/user-attachments/assets/e5483c60-d3ab-4ece-a5eb-a343fb4ca247)

3) в командной строке ввести команды *node -v*, затем *npm -v*. На обе команды должны быть отображены установленные версии **NodeJS** и **npm** соответственно.

![изображение](https://github.com/user-attachments/assets/dde3f3d6-f3ec-4bc2-9775-2b80c31f5d52)

## Загрузка и установка скрипта

1) Скачать скрипт по [ссылке](https://github.com/PrideByte/florenciadent_googlesheets_parser/archive/refs/heads/main.zip)
2) Распаковать в удобную папку и зайти в распакованную папку.
3) Распаковать архив **sensitive_data.zip** в эту же папку. Список файлов в папке скрипта должен стать таким:
![изображение](https://github.com/user-attachments/assets/bd8af4db-594a-4737-9590-549553b392a6)

4) На операционной системе Windows зажать кнопку **Shift** и нажать **Правой кнопкой мыши** на пустом месте в папке.
5) В появившемся выпадающем списке выбрать пукт **Открыть окно PowerShell здесь**
![изображение](https://github.com/user-attachments/assets/5dafc26a-a2b5-40f9-a4d7-98fae3a3c30b)
  
6) В окне командной строки (PowerShell) ввести: *npm install* и дождаться окончания установки дополнительных компонентов.
![изображение](https://github.com/user-attachments/assets/40d60261-fb59-457f-b1f1-d89d46b5614a)

## Настройка скрипта
В файле **index.js** на строках **5** и **7** можно задать таймаут (в секундах), соответственно, на сколько часто скрипт будет посылать запросы к Google Sheets и на сколько часто будет передавать полученную информацию поочередно (построчно) в Calltouch и на сайт
![изображение](https://github.com/user-attachments/assets/a6b57127-7198-43d8-9a21-0f457ce3c293)


## Запуск скрипта
В папке со скриптом, в окне командной строки (PowerShell) ввести:
1) Запуск скрипта для **Москвы**: *node --env-file=.MOS.ENV index.js*
2) Запуск скрипта для **Санкт-Петербурга**: *node --env-file=.SPB.ENV index.js*
* Примечание: для запуска скрипта и для Москвы, и для Санкт-Петербурга, потребуется открыть 2 окна командной строки, в одном запустить скрипт для Москвы, в другом - для Санкт-Петербурга.

![изображение](https://github.com/user-attachments/assets/5b343617-121b-4344-98d6-f8e04a0fd180)


Скрипт работает в автоматическом режиме, никаких действий больше не требуется.
