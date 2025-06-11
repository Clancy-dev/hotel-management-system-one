"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type LanguageCode = "en" | "zh" | "es" | "fr" | "ar" | "pt" | "de" | "ru" | "hi" | "nl" | "it" | "sw" | "lg"

interface Language {
  code: LanguageCode
  name: string
  nativeName: string
  country: string
  flag: string
  direction: "ltr" | "rtl"
  region: string
  fontFamily?: string
}

interface LanguageContextType {
  language: Language
  setLanguage: (code: LanguageCode) => void
  availableLanguages: Language[]
  t: (key: string, fallback?: string) => string
  isRTL: boolean
}

const languages: Record<LanguageCode, Language> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    country: "United Kingdom",
    flag: "🇬🇧",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    country: "China",
    flag: "🇨🇳",
    direction: "ltr",
    region: "Asia",
    fontFamily: "PingFang SC, Microsoft YaHei, sans-serif",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    country: "Spain",
    flag: "🇪🇸",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    country: "France",
    flag: "🇫🇷",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    direction: "rtl",
    region: "Middle East",
    fontFamily: "Noto Sans Arabic, Tahoma, sans-serif",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    country: "Portugal",
    flag: "🇵🇹",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    country: "Germany",
    flag: "🇩🇪",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    country: "Russia",
    flag: "🇷🇺",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    country: "India",
    flag: "🇮🇳",
    direction: "ltr",
    region: "Asia",
    fontFamily: "Noto Sans Devanagari, sans-serif",
  },
  nl: {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    country: "Netherlands",
    flag: "🇳🇱",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    country: "Italy",
    flag: "🇮🇹",
    direction: "ltr",
    region: "Europe",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  sw: {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    country: "Kenya",
    flag: "🇰🇪",
    direction: "ltr",
    region: "Africa",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  lg: {
    code: "lg",
    name: "Luganda",
    nativeName: "Oluganda",
    country: "Uganda",
    flag: "🇺🇬",
    direction: "ltr",
    region: "Africa",
    fontFamily: "Inter, system-ui, sans-serif",
  },
}

// Translation keys - this would typically come from translation files
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Settings
    "settings.title": "Settings",
    "settings.currency": "Currency",
    "settings.policy": "Hotel Policy",
    "settings.language": "Language",
    "settings.currency.description": "Choose your preferred currency for displaying prices throughout the application.",
    "settings.policy.description": "Configure your hotel's pricing policies and check-in/check-out rules.",
    "settings.language.description": "Select your preferred language for the application interface.",

    // Language Settings
    "language.current": "Current Language",
    "language.select": "Select Language",
    "language.search": "Search languages...",
    "language.save": "Save Language Settings",
    "language.preview": "Preview",
    "language.region": "Region",
    "language.direction": "Text Direction",
    "language.font": "Font Family",
    "language.changed": "Language changed to",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
    "common.search": "Search",
    "common.clear": "Clear",
    "common.reset": "Reset",
    "common.confirm": "Confirm",

    // Room Management
    "rooms.title": "Rooms",
    "rooms.add": "Add Room",
    "rooms.edit": "Edit Room",
    "rooms.delete": "Delete Room",
    "rooms.number": "Room Number",
    "rooms.category": "Category",
    "rooms.price": "Price",
    "rooms.description": "Description",
    "rooms.images": "Room Images",
  },
  zh: {
    "settings.title": "设置",
    "settings.currency": "货币",
    "settings.policy": "酒店政策",
    "settings.language": "语言",
    "settings.currency.description": "选择您在整个应用程序中显示价格的首选货币。",
    "settings.policy.description": "配置您酒店的定价政策和入住/退房规则。",
    "settings.language.description": "选择应用程序界面的首选语言。",

    "language.current": "当前语言",
    "language.select": "选择语言",
    "language.search": "搜索语言...",
    "language.save": "保存语言设置",
    "language.preview": "预览",
    "language.region": "地区",
    "language.direction": "文本方向",
    "language.font": "字体系列",
    "language.changed": "语言已更改为",

    "common.save": "保存",
    "common.cancel": "取消",
    "common.loading": "加载中...",
    "common.search": "搜索",
    "common.clear": "清除",
    "common.reset": "重置",
    "common.confirm": "确认",

    "rooms.title": "房间",
    "rooms.add": "添加房间",
    "rooms.edit": "编辑房间",
    "rooms.delete": "删除房间",
    "rooms.number": "房间号",
    "rooms.category": "类别",
    "rooms.price": "价格",
    "rooms.description": "描述",
    "rooms.images": "房间图片",
  },
  es: {
    "settings.title": "Configuración",
    "settings.currency": "Moneda",
    "settings.policy": "Política del Hotel",
    "settings.language": "Idioma",
    "settings.currency.description": "Elija su moneda preferida para mostrar precios en toda la aplicación.",
    "settings.policy.description": "Configure las políticas de precios y las reglas de check-in/check-out de su hotel.",
    "settings.language.description": "Seleccione su idioma preferido para la interfaz de la aplicación.",

    "language.current": "Idioma Actual",
    "language.select": "Seleccionar Idioma",
    "language.search": "Buscar idiomas...",
    "language.save": "Guardar Configuración de Idioma",
    "language.preview": "Vista Previa",
    "language.region": "Región",
    "language.direction": "Dirección del Texto",
    "language.font": "Familia de Fuente",
    "language.changed": "Idioma cambiado a",

    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.loading": "Cargando...",
    "common.search": "Buscar",
    "common.clear": "Limpiar",
    "common.reset": "Restablecer",
    "common.confirm": "Confirmar",

    "rooms.title": "Habitaciones",
    "rooms.add": "Agregar Habitación",
    "rooms.edit": "Editar Habitación",
    "rooms.delete": "Eliminar Habitación",
    "rooms.number": "Número de Habitación",
    "rooms.category": "Categoría",
    "rooms.price": "Precio",
    "rooms.description": "Descripción",
    "rooms.images": "Imágenes de Habitación",
  },
  fr: {
    "settings.title": "Paramètres",
    "settings.currency": "Devise",
    "settings.policy": "Politique de l'Hôtel",
    "settings.language": "Langue",
    "settings.currency.description": "Choisissez votre devise préférée pour afficher les prix dans l'application.",
    "settings.policy.description":
      "Configurez les politiques de tarification et les règles d'enregistrement/départ de votre hôtel.",
    "settings.language.description": "Sélectionnez votre langue préférée pour l'interface de l'application.",

    "language.current": "Langue Actuelle",
    "language.select": "Sélectionner la Langue",
    "language.search": "Rechercher des langues...",
    "language.save": "Enregistrer les Paramètres de Langue",
    "language.preview": "Aperçu",
    "language.region": "Région",
    "language.direction": "Direction du Texte",
    "language.font": "Famille de Police",
    "language.changed": "Langue changée en",

    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.loading": "Chargement...",
    "common.search": "Rechercher",
    "common.clear": "Effacer",
    "common.reset": "Réinitialiser",
    "common.confirm": "Confirmer",

    "rooms.title": "Chambres",
    "rooms.add": "Ajouter une Chambre",
    "rooms.edit": "Modifier la Chambre",
    "rooms.delete": "Supprimer la Chambre",
    "rooms.number": "Numéro de Chambre",
    "rooms.category": "Catégorie",
    "rooms.price": "Prix",
    "rooms.description": "Description",
    "rooms.images": "Images de Chambre",
  },
  ar: {
    "settings.title": "الإعدادات",
    "settings.currency": "العملة",
    "settings.policy": "سياسة الفندق",
    "settings.language": "اللغة",
    "settings.currency.description": "اختر العملة المفضلة لعرض الأسعار في جميع أنحاء التطبيق.",
    "settings.policy.description": "قم بتكوين سياسات التسعير وقواعد تسجيل الوصول/المغادرة لفندقك.",
    "settings.language.description": "اختر لغتك المفضلة لواجهة التطبيق.",

    "language.current": "اللغة الحالية",
    "language.select": "اختر اللغة",
    "language.search": "البحث عن اللغات...",
    "language.save": "حفظ إعدادات اللغة",
    "language.preview": "معاينة",
    "language.region": "المنطقة",
    "language.direction": "اتجاه النص",
    "language.font": "عائلة الخط",
    "language.changed": "تم تغيير اللغة إلى",

    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.loading": "جاري التحميل...",
    "common.search": "بحث",
    "common.clear": "مسح",
    "common.reset": "إعادة تعيين",
    "common.confirm": "تأكيد",

    "rooms.title": "الغرف",
    "rooms.add": "إضافة غرفة",
    "rooms.edit": "تعديل الغرفة",
    "rooms.delete": "حذف الغرفة",
    "rooms.number": "رقم الغرفة",
    "rooms.category": "الفئة",
    "rooms.price": "السعر",
    "rooms.description": "الوصف",
    "rooms.images": "صور الغرفة",
  },
  pt: {
    "settings.title": "Configurações",
    "settings.currency": "Moeda",
    "settings.policy": "Política do Hotel",
    "settings.language": "Idioma",
    "settings.currency.description": "Escolha sua moeda preferida para exibir preços em todo o aplicativo.",
    "settings.policy.description": "Configure as políticas de preços e regras de check-in/check-out do seu hotel.",
    "settings.language.description": "Selecione seu idioma preferido para a interface do aplicativo.",

    "language.current": "Idioma Atual",
    "language.select": "Selecionar Idioma",
    "language.search": "Pesquisar idiomas...",
    "language.save": "Salvar Configurações de Idioma",
    "language.preview": "Visualizar",
    "language.region": "Região",
    "language.direction": "Direção do Texto",
    "language.font": "Família da Fonte",
    "language.changed": "Idioma alterado para",

    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.loading": "Carregando...",
    "common.search": "Pesquisar",
    "common.clear": "Limpar",
    "common.reset": "Redefinir",
    "common.confirm": "Confirmar",

    "rooms.title": "Quartos",
    "rooms.add": "Adicionar Quarto",
    "rooms.edit": "Editar Quarto",
    "rooms.delete": "Excluir Quarto",
    "rooms.number": "Número do Quarto",
    "rooms.category": "Categoria",
    "rooms.price": "Preço",
    "rooms.description": "Descrição",
    "rooms.images": "Imagens do Quarto",
  },
  de: {
    "settings.title": "Einstellungen",
    "settings.currency": "Währung",
    "settings.policy": "Hotel-Richtlinie",
    "settings.language": "Sprache",
    "settings.currency.description":
      "Wählen Sie Ihre bevorzugte Währung für die Preisanzeige in der gesamten Anwendung.",
    "settings.policy.description": "Konfigurieren Sie die Preisrichtlinien und Check-in/Check-out-Regeln Ihres Hotels.",
    "settings.language.description": "Wählen Sie Ihre bevorzugte Sprache für die Anwendungsoberfläche.",

    "language.current": "Aktuelle Sprache",
    "language.select": "Sprache Auswählen",
    "language.search": "Sprachen suchen...",
    "language.save": "Spracheinstellungen Speichern",
    "language.preview": "Vorschau",
    "language.region": "Region",
    "language.direction": "Textrichtung",
    "language.font": "Schriftfamilie",
    "language.changed": "Sprache geändert zu",

    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.loading": "Laden...",
    "common.search": "Suchen",
    "common.clear": "Löschen",
    "common.reset": "Zurücksetzen",
    "common.confirm": "Bestätigen",

    "rooms.title": "Zimmer",
    "rooms.add": "Zimmer Hinzufügen",
    "rooms.edit": "Zimmer Bearbeiten",
    "rooms.delete": "Zimmer Löschen",
    "rooms.number": "Zimmernummer",
    "rooms.category": "Kategorie",
    "rooms.price": "Preis",
    "rooms.description": "Beschreibung",
    "rooms.images": "Zimmerbilder",
  },
  ru: {
    "settings.title": "Настройки",
    "settings.currency": "Валюта",
    "settings.policy": "Политика Отеля",
    "settings.language": "Язык",
    "settings.currency.description": "Выберите предпочитаемую валюту для отображения цен в приложении.",
    "settings.policy.description": "Настройте политики ценообразования и правила заезда/выезда вашего отеля.",
    "settings.language.description": "Выберите предпочитаемый язык для интерфейса приложения.",

    "language.current": "Текущий Язык",
    "language.select": "Выбрать Язык",
    "language.search": "Поиск языков...",
    "language.save": "Сохранить Настройки Языка",
    "language.preview": "Предварительный Просмотр",
    "language.region": "Регион",
    "language.direction": "Направление Текста",
    "language.font": "Семейство Шрифтов",
    "language.changed": "Язык изменен на",

    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.loading": "Загрузка...",
    "common.search": "Поиск",
    "common.clear": "Очистить",
    "common.reset": "Сброс",
    "common.confirm": "Подтвердить",

    "rooms.title": "Номера",
    "rooms.add": "Добавить Номер",
    "rooms.edit": "Редактировать Номер",
    "rooms.delete": "Удалить Номер",
    "rooms.number": "Номер Комнаты",
    "rooms.category": "Категория",
    "rooms.price": "Цена",
    "rooms.description": "Описание",
    "rooms.images": "Изображения Номера",
  },
  hi: {
    "settings.title": "सेटिंग्स",
    "settings.currency": "मुद्रा",
    "settings.policy": "होटल नीति",
    "settings.language": "भाषा",
    "settings.currency.description": "पूरे एप्लिकेशन में कीमतें प्रदर्शित करने के लिए अपनी पसंदीदा मुद्रा चुनें।",
    "settings.policy.description": "अपने होटल की मूल्य निर्धारण नीतियों और चेक-इन/चेक-आउट नियमों को कॉन्फ़िगर करें।",
    "settings.language.description": "एप्लिकेशन इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें।",

    "language.current": "वर्तमान भाषा",
    "language.select": "भाषा चुनें",
    "language.search": "भाषाएं खोजें...",
    "language.save": "भाषा सेटिंग्स सहेजें",
    "language.preview": "पूर्वावलोकन",
    "language.region": "क्षेत्र",
    "language.direction": "पाठ दिशा",
    "language.font": "फ़ॉन्ट परिवार",
    "language.changed": "भाषा बदली गई",

    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.loading": "लोड हो रहा है...",
    "common.search": "खोजें",
    "common.clear": "साफ़ करें",
    "common.reset": "रीसेट करें",
    "common.confirm": "पुष्टि करें",

    "rooms.title": "कमरे",
    "rooms.add": "कमरा जोड़ें",
    "rooms.edit": "कमरा संपादित करें",
    "rooms.delete": "कमरा हटाएं",
    "rooms.number": "कमरा संख्या",
    "rooms.category": "श्रेणी",
    "rooms.price": "कीमत",
    "rooms.description": "विवरण",
    "rooms.images": "कमरे की तस्वीरें",
  },
  nl: {
    "settings.title": "Instellingen",
    "settings.currency": "Valuta",
    "settings.policy": "Hotel Beleid",
    "settings.language": "Taal",
    "settings.currency.description": "Kies uw voorkeursvaluta voor het weergeven van prijzen in de hele applicatie.",
    "settings.policy.description": "Configureer het prijsbeleid en de in-/uitcheckregels van uw hotel.",
    "settings.language.description": "Selecteer uw voorkeurstaal voor de applicatie-interface.",

    "language.current": "Huidige Taal",
    "language.select": "Taal Selecteren",
    "language.search": "Talen zoeken...",
    "language.save": "Taalinstellingen Opslaan",
    "language.preview": "Voorbeeld",
    "language.region": "Regio",
    "language.direction": "Tekstrichting",
    "language.font": "Lettertypefamilie",
    "language.changed": "Taal gewijzigd naar",

    "common.save": "Opslaan",
    "common.cancel": "Annuleren",
    "common.loading": "Laden...",
    "common.search": "Zoeken",
    "common.clear": "Wissen",
    "common.reset": "Resetten",
    "common.confirm": "Bevestigen",

    "rooms.title": "Kamers",
    "rooms.add": "Kamer Toevoegen",
    "rooms.edit": "Kamer Bewerken",
    "rooms.delete": "Kamer Verwijderen",
    "rooms.number": "Kamernummer",
    "rooms.category": "Categorie",
    "rooms.price": "Prijs",
    "rooms.description": "Beschrijving",
    "rooms.images": "Kamerafbeeldingen",
  },
  it: {
    "settings.title": "Impostazioni",
    "settings.currency": "Valuta",
    "settings.policy": "Politica dell'Hotel",
    "settings.language": "Lingua",
    "settings.currency.description":
      "Scegli la tua valuta preferita per visualizzare i prezzi in tutta l'applicazione.",
    "settings.policy.description": "Configura le politiche di prezzo e le regole di check-in/check-out del tuo hotel.",
    "settings.language.description": "Seleziona la tua lingua preferita per l'interfaccia dell'applicazione.",

    "language.current": "Lingua Attuale",
    "language.select": "Seleziona Lingua",
    "language.search": "Cerca lingue...",
    "language.save": "Salva Impostazioni Lingua",
    "language.preview": "Anteprima",
    "language.region": "Regione",
    "language.direction": "Direzione del Testo",
    "language.font": "Famiglia di Font",
    "language.changed": "Lingua cambiata in",

    "common.save": "Salva",
    "common.cancel": "Annulla",
    "common.loading": "Caricamento...",
    "common.search": "Cerca",
    "common.clear": "Cancella",
    "common.reset": "Ripristina",
    "common.confirm": "Conferma",

    "rooms.title": "Camere",
    "rooms.add": "Aggiungi Camera",
    "rooms.edit": "Modifica Camera",
    "rooms.delete": "Elimina Camera",
    "rooms.number": "Numero Camera",
    "rooms.category": "Categoria",
    "rooms.price": "Prezzo",
    "rooms.description": "Descrizione",
    "rooms.images": "Immagini Camera",
  },
  sw: {
    "settings.title": "Mipangilio",
    "settings.currency": "Sarafu",
    "settings.policy": "Sera za Hoteli",
    "settings.language": "Lugha",
    "settings.currency.description": "Chagua sarafu unayopendelea kuonyesha bei katika programu yote.",
    "settings.policy.description": "Sanidi sera za bei na kanuni za kuingia/kutoka kwa hoteli yako.",
    "settings.language.description": "Chagua lugha unayopendelea kwa kiolesura cha programu.",

    "language.current": "Lugha ya Sasa",
    "language.select": "Chagua Lugha",
    "language.search": "Tafuta lugha...",
    "language.save": "Hifadhi Mipangilio ya Lugha",
    "language.preview": "Onyesho la Awali",
    "language.region": "Mkoa",
    "language.direction": "Mwelekeo wa Maandishi",
    "language.font": "Familia ya Fonti",
    "language.changed": "Lugha imebadilishwa kuwa",

    "common.save": "Hifadhi",
    "common.cancel": "Ghairi",
    "common.loading": "Inapakia...",
    "common.search": "Tafuta",
    "common.clear": "Futa",
    "common.reset": "Weka Upya",
    "common.confirm": "Thibitisha",

    "rooms.title": "Vyumba",
    "rooms.add": "Ongeza Chumba",
    "rooms.edit": "Hariri Chumba",
    "rooms.delete": "Futa Chumba",
    "rooms.number": "Nambari ya Chumba",
    "rooms.category": "Jamii",
    "rooms.price": "Bei",
    "rooms.description": "Maelezo",
    "rooms.images": "Picha za Chumba",
  },
  lg: {
    "settings.title": "Enteekateeka",
    "settings.currency": "Ssente",
    "settings.policy": "Enkola za Hoteli",
    "settings.language": "Olulimi",
    "settings.currency.description": "Londa ssente z'oyagala okulaga emiwendo mu pulogulaamu yonna.",
    "settings.policy.description": "Tegeka enkola z'emiwendo n'amateeka g'okuyingira/okufuluma mu hoteli yo.",
    "settings.language.description": "Londa olulimi lw'oyagala olw'enkola ya pulogulaamu.",

    "language.current": "Olulimi Olw'omu Kiseera Kino",
    "language.select": "Londa Olulimi",
    "language.search": "Noonya ennimi...",
    "language.save": "Kuuma Enteekateeka z'Olulimi",
    "language.preview": "Kulaba nga Bwe Kijja Kuba",
    "language.region": "Ekitundu",
    "language.direction": "Ekkubo ly'Ebiwandiiko",
    "language.font": "Ekika ky'Ennukuta",
    "language.changed": "Olulimi lukyusiddwa okudda ku",

    "common.save": "Kuuma",
    "common.cancel": "Sazaamu",
    "common.loading": "Kitegekebwa...",
    "common.search": "Noonya",
    "common.clear": "Sangula",
    "common.reset": "Ddamu ku Ntandikwa",
    "common.confirm": "Kakasa",

    "rooms.title": "Ebisenge",
    "rooms.add": "Yongera Ekisenge",
    "rooms.edit": "Kyusa Ekisenge",
    "rooms.delete": "Gyawo Ekisenge",
    "rooms.number": "Ennamba y'Ekisenge",
    "rooms.category": "Ekika",
    "rooms.price": "Emiwendo",
    "rooms.description": "Okunnyonnyola",
    "rooms.images": "Ebifaananyi by'Ekisenge",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages.en)

  useEffect(() => {
    // Load saved language from localStorage on component mount
    const savedLanguage = localStorage.getItem("preferredLanguage") as LanguageCode | null
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(languages[savedLanguage])
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as LanguageCode
      if (languages[browserLang]) {
        setCurrentLanguage(languages[browserLang])
      }
    }
  }, [])

  // Apply language-specific styles to document
  useEffect(() => {
    document.documentElement.lang = currentLanguage.code
    document.documentElement.dir = currentLanguage.direction

    // Apply font family
    if (currentLanguage.fontFamily) {
      document.documentElement.style.fontFamily = currentLanguage.fontFamily
    }

    // Add RTL class for Arabic
    if (currentLanguage.direction === "rtl") {
      document.documentElement.classList.add("rtl")
    } else {
      document.documentElement.classList.remove("rtl")
    }
  }, [currentLanguage])

  const setLanguage = (code: LanguageCode) => {
    if (languages[code]) {
      setCurrentLanguage(languages[code])
      localStorage.setItem("preferredLanguage", code)
    }
  }

  const t = (key: string, fallback?: string) => {
    const translation = translations[currentLanguage.code]?.[key]
    return translation || fallback || key
  }

  const availableLanguages = Object.values(languages)

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguage,
        setLanguage,
        availableLanguages,
        t,
        isRTL: currentLanguage.direction === "rtl",
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
