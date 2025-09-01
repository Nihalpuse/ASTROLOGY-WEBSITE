interface BlogPost {
  title: { [lang: string]: string };
  description: { [lang: string]: string };
  content: { [lang: string]: string };
  imageUrl: string;
  themeColor: string;
  author: { en: string; hi: string; es: string; fr: string; de: string; zh: string; ar: string; ru: string };
  date: string; // ISO format, e.g., '2024-04-15'
  category: string;
}

export const blogPosts: Record<string, BlogPost> = {
  "influence-of-planets": {
    title: {
      en: "The Influence of Planets",
      hi: "ग्रहों का प्रभाव",
      es: "La influencia de los planetas",
      fr: "L'influence des planètes",
      de: "Der Einfluss der Planeten",
      zh: "行星的影响",
      ar: "تأثير الكواكب",
      ru: "Влияние планет"
    },
    description: {
      en: "Discover how celestial bodies affect our daily lives and spiritual journey.",
      hi: "खगोलीय पिंड हमारे दैनिक जीवन और आध्यात्मिक यात्रा को कैसे प्रभावित करते हैं, इस विषय की गहन जानकारी।",
      es: "Descubre cómo los cuerpos celestes afectan nuestra vida diaria y nuestro viaje espiritual.",
      fr: "Découvrez comment les corps célestes influencent notre vie quotidienne et notre parcours spirituel.",
      de: "Entdecken Sie, wie Himmelskörper unser tägliches Leben und unsere spirituelle Reise beeinflussen.",
      zh: "探索天体如何影响我们的日常生活和精神旅程。",
      ar: "اكتشف كيف تؤثر الأجرام السماوية على حياتنا اليومية ورحلتنا الروحية.",
      ru: "Узнайте, как небесные тела влияют на нашу повседневную жизнь и духовный путь."
    },
    content: {
      en: `Discover how celestial bodies affect our daily lives and spiritual journey.\n\nKey Points:\n• Importance of the Nine Planets\n• Effects of Planetary Movements\n• Planetary Periods and Sub-periods\n• Planetary Remedies`,
      hi: `खगोलीय पिंड हमारे दैनिक जीवन और आध्यात्मिक यात्रा को कैसे प्रभावित करते हैं, इस विषय की गहन जानकारी।\n\nप्रमुख बिंदु:\n• नवग्रहों का महत्व\n• ग्रहों की चाल का प्रभाव\n• ग्रह दशा और अंतर्दशा\n• ग्रहों के उपाय`,
      es: `Descubre cómo los cuerpos celestes afectan nuestra vida diaria y nuestro viaje espiritual.\n\nPuntos clave:\n• Importancia de los nueve planetas\n• Efectos de los movimientos planetarios\n• Períodos y subperíodos planetarios\n• Remedios planetarios`,
      fr: `Découvrez comment les corps célestes influencent notre vie quotidienne et notre parcours spirituel.\n\nPoints clés :\n• Importance des neuf planètes\n• Effets des mouvements planétaires\n• Périodes et sous-périodes planétaires\n• Remèdes planétaires`,
      de: `Entdecken Sie, wie Himmelskörper unser tägliches Leben und unsere spirituelle Reise beeinflussen.\n\nWichtige Punkte:\n• Bedeutung der neun Planeten\n• Auswirkungen planetarer Bewegungen\n• Planetenperioden und Unterperioden\n• Planetarische Heilmittel`,
      zh: `探索天体如何影响我们的日常生活和精神旅程。\n\n要点：\n• 九大行星的重要性\n• 行星运动的影响\n• 行星周期和子周期\n• 行星疗法`,
      ar: `اكتشف كيف تؤثر الأجرام السماوية على حياتنا اليومية ورحلتنا الروحية.\n\nالنقاط الرئيسية:\n• أهمية الكواكب التسعة\n• تأثيرات حركات الكواكب\n• الفترات الكوكبية والفترات الفرعية\n• العلاجات الكوكبية`,
      ru: `Узнайте, как небесные тела влияют на нашу повседневную жизнь и духовный путь.\n\nКлючевые моменты:\n• Важность девяти планет\n• Влияние движений планет\n• Планетарные периоды и подпериоды\n• Планетарные средства`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049128/planets_aeujo5.jpg",
    themeColor: "#a78bfa",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Astrology"
  },
  "understanding-vedic-astrology": {
    title: {
      en: "Understanding Vedic Astrology",
      hi: "वैदिक ज्योतिष को समझना",
      es: "Entender la astrología védica",
      fr: "Comprendre l'astrologie védique",
      de: "Vedic Astrologie verstehen",
      zh: "理解吠陀占星术",
      ar: "فهم علم الزمان الوصي",
      ru: "Понимание ведической астрологии"
    },
    description: {
      en: "Learn the fundamentals of Vedic astrology and its impact on life decisions.",
      hi: "वैदिक ज्योतिष के मूल सिद्धांतों और जीवन के निर्णयों पर इसके प्रभाव की विस्तृत जानकारी।",
      es: "Aprende los fundamentos de la astrología védica y su impacto en las decisiones de la vida.",
      fr: "Apprenez les principes fondamentaux de l'astrologie védique et son impact sur les décisions de la vie.",
      de: "Entdecken Sie die Grundlagen der vedichen Astrologie und deren Einfluss auf Lebensentscheidungen.",
      zh: "了解吠陀占星术的基本原理及其对生活决策的影响。",
      ar: "تعرف على الأساسيات لعلم الزمان الوصي وتأثيره على القرارات المعنوية.",
      ru: "Узнайте основы ведической астрологии и её влияние на жизненные решения."
    },
    content: {
      en: `Learn the fundamentals of Vedic astrology and its impact on life decisions.\n\nMain Topics:\n• Importance of Birth Chart\n• Influence of Zodiac Signs\n• Planetary Combinations\n• Dasha System`,
      hi: `वैदिक ज्योतिष के मूल सिद्धांतों और जीवन के निर्णयों पर इसके प्रभाव की विस्तृत जानकारी।\n\nमुख्य विषय:\n• जन्म कुंडली का महत्व\n• राशियों का प्रभाव\n• ग्रह योग\n• दशा प्रणाली`,
      es: `Aprende los fundamentos de la astrología védica y su impacto en la vida.\n\nTemas principales:\n• Importancia del gráfico de nacimiento\n• Influencia de los signos zodiacales\n• Combinaciones planetarias\n• Sistema Dasha`,
      fr: `Apprenez les principes fondamentaux de l'astrologie védique et son impact sur la vie.\n\nThèmes principaux :\n• Importance du graphique de naissance\n• Influence des signes zodiaques\n• Combinations planétaires\n• Système Dasha`,
      de: `Entdecken Sie die Grundlagen der vedichen Astrologie und deren Einfluss auf Lebensentscheidungen.\n\nWichtige Themen:\n• Bedeutung des Geburtscharts\n• Einfluss der Tierkreiszeichen\n• Planetenkombinationen\n• Dasha-System`,
      zh: `了解吠陀占星术的基本原理及其对生活决策的影响。\n\n主要主题：\n• 出生图的重要性\n• 十二星座的影响\n• 行星组合\n• 达沙系统`,
      ar: `تعرف على الأساسيات لعلم الزمان الوصي وتأثيره على القرارات المعنوية.\n\nالمواضيع الرئيسية:\n• أهمية مخطط الميلاد\n• تأثير علامات الدوران\n• تجميعات الكواكب\n• نظام داشا`,
      ru: `Узнайте основы ведической астрологии и её влияние на жизненные решения.\n\nКлючевые темы:\n• Важность рождественского графика\n• Влияние знаков зодиака\n• Планетарные комбинации\n• Планетарная система`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049129/vedicastrology_azoqie.jpg",
    themeColor: "#fca4a4",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Astrology"
  },
  "gemstones-and-powers": {
    title: {
      en: "Gemstones and Their Powers",
      hi: "रत्नों की शक्तियां",
      es: "Piedras y sus poderes",
      fr: "Pierre et leur pouvoir",
      de: "Edelsteine und ihre Kräfte",
      zh: "宝石及其力量",
      ar: "الأحجار الكريمة وقوتها",
      ru: "Камни и их силы"
    },
    description: {
      en: "Explore the mystical properties of gemstones and their astrological significance.",
      hi: "रत्नों के रहस्यमय गुणों और उनके ज्योतिषीय महत्व की विस्तृत जानकारी।",
      es: "Explora las propiedades místicas de las piedras y su significado astrológico.",
      fr: "Explorez les propriétés mystérieuses des pierres et leur signification astrologique.",
      de: "Entdecken Sie die mystischen Eigenschaften von Edelsteinen und ihren astrologischen Bedeutungen.",
      zh: "探索宝石的神秘性质及其占星意义。",
      ar: "استكشف خصائص الأحجار الكريمة ومعناها الصفحي.",
      ru: "Исследуйте мистические свойства камней и их астрологическое значение."
    },
    content: {
      en: `Explore the mystical properties of gemstones and their astrological significance.\n\nMajor Gemstones:\n• Yellow Sapphire - Jupiter's Stone\n• Pearl - Moon's Stone\n• Ruby - Sun's Stone\n• Emerald - Mercury's Stone`,
      hi: `रत्नों के रहस्यमय गुणों और उनके ज्योतिषीय महत्व की विस्तृत जानकारी।\n\nप्रमुख रत्न:\n• पुखराज - गुरु का रत्न\n• मोती - चंद्र का रत्न\n• माणिक - सूर्य का रत्न\n• पन्ना - बुध का रत्न`,
      es: `Explora las propiedades místicas de las piedras y su significado astrológico.\n\nPiedras principales:\n• Ámbar - Piedra de Júpiter\n• Perla - Piedra de la Luna\n• Rubí - Piedra del Sol\n• Esmeralda - Piedra de Mercurio`,
      fr: `Explorez les propriétés mystérieuses des pierres et leur signification astrologique.\n\nPierres principales :\n• Améthyste - Pierre de Jupiter\n• Perle - Pierre de la Lune\n• Rubis - Pierre du Soleil\n• Émeraude - Pierre de Mercure`,
      de: `Entdecken Sie die mystischen Eigenschaften von Edelsteinen und ihren astrologischen Bedeutungen.\n\nHauptsteine:\n• Gelber Saphir - Jupiterstein\n• Perle - Mondstein\n• Rubin - Sonnenstein\n• Smaragd - Merkurstein`,
      zh: `探索宝石的神秘性质及其占星意义。\n\n主要宝石：\n• 黄宝石 - 木星石\n• 珍珠 - 月球石\n• 红宝石 - 太阳石\n• 祖母绿 - 水星石`,
      ar: `استكشف خصائص الأحجار الكريمة ومعناها الصفحي.\n\nالأحجار الكريمة الرئيسية:\n• الأمبراطوري - حجر جوبيتر\n• الأسد - حجر القمر\n• الروبي - حجر الشمس\n• الأميرث - حجر ميركوري`,
      ru: `Исследуйте мистические свойства камней и их астрологическое значение.\n\nОсновные камни:\n• Желтый сапфир - Юпитерский камень\n• Перл - Лунный камень\n• Рубин - Солнечный камень\n• Изумруд - Меркурианский камень`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/gemstones_wztxzb.jpg",
    themeColor: "#86efad",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Astrology"
  },
  "numerology-basics": {
    title: {
      en: "Numerology Basics",
      hi: "अंक ज्योतिष का परिचय",
      es: "Conceptos básicos de numerología",
      fr: "Concepts de base de la numérologie",
      de: "Numerologie Grundlagen",
      zh: "数字占星术基础",
      ar: "مبادئ الرقمية",
      ru: "Основы нумерологии"
    },
    description: {
      en: "Understanding how numbers influence your life path and destiny.",
      hi: "संख्याओं का जीवन पर प्रभाव और उनका वैज्ञानिक महत्व।",
      es: "Entender cómo los números influyen en tu camino de vida y destino.",
      fr: "Comprendre comment les chiffres influencent votre chemin de vie et votre destiné.",
      de: "Verstehen, wie Zahlen Ihr Lebensweg und Ihren Zweck beeinflussen.",
      zh: "了解数字如何影响你的生活道路和命运。",
      ar: "فهم تأثير الأرقام على مسار حياتك ومأموريتك.",
      ru: "Понимание влияния чисел на ваш жизненный путь и предназначение."
    },
    content: {
      en: `Understanding how numbers influence your life path and destiny.\n\nBasic Principles:\n• Calculating Root Number\n• Significance of Destiny Number\n• Name's Influence\n• Nature of Numbers`,
      hi: `संख्याओं का जीवन पर प्रभाव और उनका वैज्ञानिक महत्व।\n\nमूल सिद्धांत:\n• मूलांक की गणना\n• भाग्यांक का महत्व\n• नाम का प्रभाव\n• अंकों का स्वभाव`,
      es: `Entender cómo los números influyen en tu camino de vida y destino.\n\nPrincipios básicos:\n• Calcular el número raíz\n• Significado del número de destino\n• Influencia del nombre\n• Naturaleza de los números`,
      fr: `Comprendre comment les chiffres influencent votre chemin de vie et votre destiné.\n\nPrincipes de base :\n• Calculer le nombre de racine\n• Signification du nombre de destiné\n• Influence du nom\n• Nature des chiffres`,
      de: `Verstehen, wie Zahlen Ihr Lebensweg und Ihren Zweck beeinflussen.\n\nGrundprinzipien :\n• Wurzelnummer berechnen\n• Bedeutung der Lebensnummer\n• Einfluss des Namens\n• Natur der Zahlen`,
      zh: `了解数字如何影响你的生活道路和命运。\n\n基本原则：\n• 计算根数字\n• 命运数字的意义\n• 名称的影响\n• 数字的性质`,
      ar: `فهم تأثير الأرقام على مسار حياتك ومأموريتك.\n\nمبادئ أساسية:\n• حساب رقم الجذر\n• أهمية الرقم المأمور\n• تأثير الاسم\n• طبيعة الأرقام`,
      ru: `Понимание влияния чисел на ваш жизненный путь и предназначение.\n\nОсновные принципы:\n• Расчет корневого числа\n• Значение жизненного числа\n• Влияние имени\n• Природа чисел`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049129/numerology_yl4ss6.jpg  ",
    themeColor: "#a78bfa",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Astrology"
  },
  "understanding-your-birth-chart": {
    title: {
      en: "Understanding Your Birth Chart",
      hi: "अपनी जन्म कुंडली को समझना",
      es: "Entender tu gráfico de nacimiento",
      fr: "Comprendre votre graphique de naissance",
      de: "Ihr Geburtschart verstehen",
      zh: "理解你的出生图",
      ar: "فهم مخطط ميلادك",
      ru: "Понимание вашего рождественского графика"
    },
    description: {
      en: "A birth chart is a vital map of your life, showing the position of planets at the time of your birth.",
      hi: "जन्म कुंडली आपके जीवन का एक महत्वपूर्ण मानचित्र है। यह आपके जन्म के समय आकाश में ग्रहों की स्थिति को दर्शाती है।",
      es: "Un gráfico de nacimiento es un mapa vital de tu vida, que muestra la posición de los planetas en el momento de tu nacimiento.",
      fr: "Un graphique de naissance est une carte vitale de votre vie, montrant la position des planètes au moment de votre naissance.",
      de: "Ein Geburtschart ist ein vitaler Kartenstandort Ihres Lebens, der die Position der Planeten zu Ihrer Geburt zeigt.",
      zh: "出生图是您生活的关键地图，显示了您出生时行星的位置。",
      ar: "مخطط الميلاد هو مخطط حيوي لحياتك ، يظهر موقع الكواكب في وقت ميلادك.",
      ru: "Рождественский график — это важный карточный план вашей жизни, показывающий положение планет в момент вашего рождения."
    },
    content: {
      en: `A birth chart is a vital map of your life, showing the position of planets at the time of your birth.\n\nKey Components of Birth Chart:\n• Ascendant - Your personal identity\n• Sun - Your core nature\n• Moon - Your mental nature\n• Nine Planets - Influencing different aspects of life\n\nPoints to understand your horoscope:\n1. Importance of zodiac signs\n2. Position of planets\n3. Impact of houses\n4. Major and sub-periods`,
      hi: `जन्म कुंडली आपके जीवन का एक महत्वपूर्ण मानचित्र है। यह आपके जन्म के समय आकाश में ग्रहों की स्थिति को दर्शाती है।

जन्म कुंडली के मुख्य घटक:
• लग्न - आपकी व्यक्तिगत पहचान
• सूर्य - आपका मूल स्वभाव
• चंद्र - आपका मानसिक स्वभाव
• नवग्रह - जीवन के विभिन्न पहलुओं को प्रभावित करने वाले ग्रह

अपनी कुंडली को समझने के लिए इन बिंदुओं पर ध्यान दें:
1. राशियों का महत्व
2. ग्रहों की स्थिति
3. भावों का प्रभाव
4. दशा और अंतर्दशा`,
      es: `Un gráfico de nacimiento es un mapa vital de tu vida, que muestra la posición de los planetas en el momento de tu nacimiento.\n\nComponentes clave del gráfico de nacimiento:\n• Ascendente - Tu identidad personal\n• Sol - Tu naturaleza básica\n• Luna - Tu naturaleza mental\n• Nueve planetas - Influyendo diferentes aspectos de la vida\n\nPuntos para entender tu horóscopo:\n1. Importancia de los signos zodiacales\n2. Posición de los planetas\n3. Impacto de las casas\n4. Mayores y subperíodos`,
      fr: `Un graphique de naissance est une carte vitale de votre vie, montrant la position des planètes au moment de votre naissance.\n\nComposants clés du graphique de naissance :\n• Ascendant - Votre identité personnelle\n• Soleil - Votre nature de base\n• Lune - Votre nature mentale\n• Neuf planètes - Influençant différents aspects de la vie\n\nPoints pour comprendre votre horoscope :\n1. Importance des signes zodiaques\n2. Position des planètes\n3. Impact des maisons\n4. Majeurs et sous-périodes`,
      de: `Ein Geburtschart ist ein vitaler Kartenstandort Ihres Lebens, der die Position der Planeten zu Ihrer Geburt zeigt.\n\nWichtige Komponenten des Geburtscharts :\n• Aufsteiger - Ihre persönliche Identität\n• Sonne - Ihre Kernnatur\n• Mond - Ihre mentale Natur\n• Neun Planeten - Einfluss auf verschiedene Aspekte des Lebens\n\nPunkte, um Ihren Horoskop zu verstehen :\n1. Bedeutung der Tierkreiszeichen\n2. Position der Planeten\n3. Einfluss der Hausnummern\n4. Haupt- und Unterperioden`,
      zh: `出生图是您生活的关键地图，显示了您出生时行星的位置。\n\n出生图的关键组成部分：\n• 上升 - 您的个人身份\n• 太阳 - 您的核心性质\n• 月亮 - 您的精神性质\n• 九大行星 - 影响生活的不同方面\n\n要点，了解您的星座：\n1. 十二星座的重要性\n2. 行星的位置\n3. 宫位的影响\n4. 主要和次要时期`,
      ar: `مخطط الميلاد هو مخطط حيوي لحياتك ، يظهر موقع الكواكب في وقت ميلادك.\n\nالمكونات الرئيسية لمخطط الميلاد:\n• الطلوع - الهوية الشخصية\n• الشمس - الطبيعة الأساسية\n• القمر - الطبيعة العقلية\n• الكواكب التسعة - تأثير جوانب مختلفة من الحياة\n\نقاط لفهم الهوروسكوب:\n1. أهمية الإشارات الصيدلية\n2. موقع الكواكب\n3. تأثير المنازل\n4. الفترات الرئيسية والفترات الفرعية`,
      ru: `Рождественский график — это важный карточный план вашей жизни, показывающий положение планет в момент вашего рождения.\n\nКлючевые компоненты рождественского графика:\n• Восходящий знак - ваша личная идентичность\n• Солнце - ваша базовая природа\n• Луна - ваша ментальная природа\n• Девять планет - влияние различных аспектов жизни\n\nТочки для понимания гороскопа:\n1. Важность знаков зодиака\n2. Положение планет\n3. Влияние домов\n4. Главные и подпериоды`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/birth-chart_zqq2nn.jpg",
    themeColor: "#fca4a4",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Astrology"
  },
  "power-of-meditation": {
    title: {
      en: "The Power of Meditation",
      hi: "ध्यान की शक्ति",
      es: "El poder del meditación",
      fr: "Le pouvoir de la méditation",
      de: "Die Kraft der Meditation",
      zh: "冥想的威力",
      ar: "طاقة التأمل",
      ru: "Могущество медитации"
    },
    description: {
      en: "Meditation is an ancient practice that brings peace to mind and body.",
      hi: "ध्यान एक प्राचीन अभ्यास है जो मन और शरीर को शांति प्रदान करता है।",
      es: "La meditación es una práctica antigua que trae paz a la mente y el cuerpo.",
      fr: "La méditation est une pratique ancienne qui apporte la paix à l'esprit et au corps.",
      de: "Meditation ist eine alte Praxis, die Ruhe in den Geist und den Körper bringt.",
      zh: "冥想是一种古老的实践，可以带来内心的平静和身体的安宁。",
      ar: "التأمل هو تمرين قديم يجلب السلامة إلى العقل والجسم.",
      ru: "Медитация — это древняя практика, которая приносит покой душе и телу."
    },
    content: {
      en: `Meditation is an ancient practice that brings peace to mind and body.\n\nTypes of Meditation:\n• Breath Awareness\n• Mantra Chanting\n• Visualization\n• Body Scan\n\nBenefits of Meditation:\n1. Stress Reduction\n2. Increased Focus\n3. Emotional Balance\n4. Spiritual Growth`,
      hi: `ध्यान एक प्राचीन अभ्यास है जो मन और शरीर को शांति प्रदान करता है।

ध्यान के प्रकार:
• श्वास पर ध्यान
• मंत्र जप
• विजुअलाइजेशन
• बॉडी स्कैन

ध्यान के लाभ:
1. तनाव में कमी
2. एकाग्रता में वृद्धि
3. भावनात्मक संतुलन
4. आध्यात्मिक विकास`,
      es: `La meditación es una práctica antigua que trae paz a la mente y el cuerpo.\n\nTipos de meditación:\n• Concienciación del aliento\n• Canto de mantras\n• Visualización\n• Escaneo corporal\n\nBeneficios de la meditación:\n1. Reducción del estrés\n2. Incremento de la concentración\n3. Equilibrio emocional\n4. Crecimiento espiritual`,
      fr: `La méditation est une pratique ancienne qui apporte la paix à l'esprit et au corps.\n\nTypes de méditation :\n• Sensation de l'inspiration\n• Chantement de mantra\n• Visualisation\n• Scan corporel\n\nAvantages de la méditation :\n1. Réduction de la tension\n2. Augmentation de la concentration\n3. Équilibre émotionnel\n4. Croissance spirituelle`,
      de: `Meditation ist eine alte Therapie, die Ruhe in den Geist und den Körper bringt.\n\nArten von Meditation :\n• Atembewusstsein\n• Mantra-Gesang\n• Visualisierung\n• Körper-Scan\n\nVorteile der Meditation :\n1. Stressreduktion\n2. Fokussierung\n3. Emotionales Gleichgewicht\n4. Geistiges Wachstum`,
      zh: `冥想是一种古老的实践，可以带来内心的平静和身体的安宁。\n\n冥想类型：\n• 呼吸意识\n• 咒语吟诵\n• 可视化\n• 身体扫描\n\n冥想的益处：\n1. 压力减少\n2. 专注增加\n3. 情绪平衡\n4. 精神成长`,
      ar: `التأمل هو تمرين قديم يجلب السلامة إلى العقل والجسم.\n\nأنواع التأمل:\n• إدراك التنفس\n• صدي المنترا\n• التصور\n• التحميل الجسدي\n\nفوائد التأمل:\n1. تقليل الإجهاد\n2. زيادة التركيز\n3. توازن عاطفي\n4. النمو الروحي`,
      ru: `Медитация — это древняя практика, которая приносит покой душе и телу.\n\nТипы медитации:\n• Дыхательное сознание\n• Чтение мантры\n• Визуализация\n• Сканирование тела\n\nПреимущества медитации:\n1. Снижение стресса\n2. Увеличение концентрации\n3. Эмоциональное равновесие\n4. Духовное развитие`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/meditation_b2qe9b.jpg",
    themeColor: "#86efad",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Spiritual Healing"
  },
  "unveiling-nakshatra-secrets": {
    title: {
      en: "Unveiling Nakshatra Secrets",
      hi: "नक्षत्रों के रहस्य",
      es: "Desvelar secretos de nakshatra",
      fr: "Dévoiler les secrets de nakshatra",
      de: "Nakshatra-Geheimnisse enthüllen",
      zh: "揭示纳什特拉秘密",
      ar: "إكشف أسرار نكشترا",
      ru: "Раскрытие секретов Накшатры"
    },
    description: {
      en: "Nakshatras, or lunar mansions, are a crucial part of Vedic astrology. They play a significant role in shaping our personality and destiny.",
      hi: "नक्षत्र, या चंद्र हवेली, वैदिक ज्योतिष का एक महत्वपूर्ण हिस्सा हैं। वे हमारे व्यक्तित्व और भाग्य को आकार देने में महत्वपूर्ण भूमिका निभाते हैं।",
      es: "Nakshatras, o lunaciones, son una parte crucial de la astrología védica. Juegan un papel importante en la forma de nuestra personalidad y destino.",
      fr: "Nakshatras, ou mansions lunaires, sont une partie importante de l'astrologie védique. Ils jouent un rôle important dans la forme de notre personnalité et de notre destiné.",
      de: "Nakshatras, oder lunare Mansions, sind ein wichtiger Bestandteil der vedichen Astrologie. Sie spielen eine wichtige Rolle bei der Gestaltung unserer Persönlichkeit und unserem Schicksal.",
      zh: "纳什特拉，或称月度宫，是吠陀占星术的重要组成部分。它们在塑造我们的个性和命运方面起着重要作用。",
      ar: "نكشترا ، أو سكون القمر ، جزء حيوي من علم الزمان الوصي. هم يلعبون دورًا حيويًا في تشكيل هويتنا ومأموريتنا.",
      ru: "Накшатры, или лунные дома, являются важной частью ведической астрологии. Они играют важную роль в формировании нашей личности и судьбы."
    },
    content: {
      en: `Nakshatras, or lunar mansions, are a crucial part of Vedic astrology. They play a significant role in shaping our personality and destiny.\n\nKey Nakshatras and Their Influence:\n• Ashwini - Beginnings and healing\n• Bharani - Transformation and desire\n• Krittika - Power and ambition\n• Rohini - Growth and creativity\n\nSignificance of Nakshatras:\n1. Birth Nakshatra: Determines your core nature and life path.\n2. Marriage Compatibility: Nakshatras are matched to assess compatibility in marriage.\n3. Muhurta: Nakshatras are used to select auspicious timings for important events.`,
      hi: `नक्षत्र, या चंद्र हवेली, वैदिक ज्योतिष का एक महत्वपूर्ण हिस्सा हैं। वे हमारे व्यक्तित्व और भाग्य को आकार देने में महत्वपूर्ण भूमिका निभाते हैं।\n\nप्रमुख नक्षत्र और उनके प्रभाव:\n• अश्विनी - शुरुआत और उपचार\n• भरणी - परिवर्तन और इच्छा\n• कृत्तिका - शक्ति और महत्वाकांक्षा\n• रोहिणी - विकास और रचनात्मकता\n\nनक्षत्रों का महत्व:\n1.  जन्म नक्षत्र: आपके मूल स्वभाव और जीवन पथ को निर्धारित करता है।\n2.  विवाह अनुकूलता: विवाह में अनुकूलता का आकलन करने के लिए नक्षत्रों का मिलान किया जाता है।\n3.  मुहूर्त: शुभ समय का चयन करने के लिए नक्षत्रों का उपयोग किया जाता है।`,
      es: `Nakshatras, o lunaciones, son una parte crucial de la astrología védica. Juegan un papel importante en la forma de nuestra personalidad y destino.\n\nNakshatras clave y su influencia:\n• Ashwini - Comienzos y curación\n• Bharani - Transformación y deseo\n• Krittika - Poder y ambición\n• Rohini - Crecimiento y creatividad\n\nSignificado de Nakshatras:\n1. Nakshatra de nacimiento: Determina tu naturaleza y ruta de vida.\n2. Compatibilidad matrimonial: Nakshatras se emparejan para evaluar compatibilidad matrimonial.\n3. Muhurta: Nakshatras se utilizan para seleccionar momentos auspiciosos para eventos importantes.`,
      fr: `Nakshatras, ou mansions lunaires, sont une partie importante de l'astrologie védique. Ils jouent un rôle important dans la forme de notre personnalité et de notre destiné.\n\nNakshatras clés et leur influence :\n• Ashwini - Commencements et guérison\n• Bharani - Transformation et désir\n• Krittika - Puissance et ambition\n• Rohini - Croissance et créativité\n\nSignification des Nakshatras :\n1. Nakshatra de naissance : Détermine votre nature et votre chemin de vie.\n2. Compatibilité matrimoniale : Les Nakshatras sont associés pour évaluer la compatibilité matrimoniale.\n3. Muhurta : Les Nakshatras sont utilisés pour sélectionner des moments propices pour des événements importants.`,
      de: `Nakshatras, oder lunare Mansions, sind ein wichtiger Bestandteil der vedichen Astrologie. Sie spielen eine wichtige Rolle bei der Gestaltung unserer Persönlichkeit und unserem Schicksal.\n\nWichtige Nakshatras und Ihr Einfluss :\n• Ashwini - Beginnungen und Heilung\n• Bharani - Transformation und Neigung\n• Krittika - Kraft und Ehrgeiz\n• Rohini - Wachstum und Schöpfung\n\nBedeutung der Nakshatras :\n1. Geburtsnakshatra : Bestimmt Ihre Kernnatur und Ihren Lebensweg.\n2. Heiratsverträglichkeit : Nakshatras werden zusammengeführt, um die Heiratsverträglichkeit zu bewerten.\n3. Muhurta : Nakshatras werden verwendet, um günstige Zeiten für wichtige Ereignisse auszuwählen.`,
      zh: `纳什特拉，或称月度宫，是吠陀占星术的重要组成部分。它们在塑造我们的个性和命运方面起着重要作用。\n\n关键纳什特拉及其影响：\n• 阿什维尼 - 开始和治疗\n• 巴哈尼 - 转变和欲望\n• 克里蒂卡 - 力量和野心\n• 罗希尼 - 成长和创造力\n\n纳什特拉的意义：\n1. 出生纳什特拉：确定你的核心性质和生命路径。\n2. 婚姻兼容性：纳什特拉将与婚姻兼容性进行匹配。\n3. 穆胡尔塔：纳什特拉用于选择重要事件的吉祥时间。`,
      ar: `نكشترا ، أو سكون القمر ، جزء حيوي من علم الزمان الوصي. هم يلعبون دورًا حيويًا في تشكيل هويتنا ومأموريتنا.\n\نكشترات أساسية وتأثيرها:\n• الأشويني - بدايات وعلاج\n• بهاراني - تحويل ورغبة\n• كريتيكا - قوة وطمأنين\n• روهيني - نمو وإبداع\n\معنى نكشترات:\n1. نكشترا الميلاد: يحدد طبيعتك الأساسية ومسار حياتك.\n2. توافق الزواج: تُقابل نكشترات لتقييم توافق الزواج.\n3. محرتا: تُستخدم نكشترات لاختيار مواعيد طيبة لأحداث مهمة.`
    },
    imageUrl: "/images/blog/nakshatra.jpg",
    themeColor: "#a78bfa",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Astrology"
  },
  "crystal-healing": {
    title: {
      en: "Guide to Crystal Healing",
      hi: "क्रिस्टल हीलिंग का मार्गदर्शन",
      es: "Guía para la curación con cristal",
      fr: "Guide pour la guérison cristalline",
      de: "Leitfaden für Kristallheilung",
      zh: "水晶治疗的指南",
      ar: "دليل العلاج بالكريستال",
      ru: "Руководство по кристаллическому лечению"
    },
    description: {
      en: "Crystal healing is an ancient therapy based on energy balance.",
      hi: "क्रिस्टल हीलिंग एक प्राचीन उपचार पद्धति है जो ऊर्जा के संतुलन पर आधारित है।",
      es: "La curación con cristal es una terapia antigua basada en el equilibrio de energía.",
      fr: "La guérison cristalline est une thérapie ancienne basée sur l'équilibre énergétique.",
      de: "Kristallheilung ist eine alte Therapie, die auf Energiegleichgewicht basiert.",
      zh: "水晶治疗是一种基于能量平衡的古老疗法。",
      ar: "العلاج بالكريستال هو تمرين صفحي قديم يعتمد على توازن الطاقة.",
      ru: "Кристальное лечение — это древняя терапия, основанная на энергетическом балансе."
    },
    content: {
      en: `Crystal healing is an ancient therapy based on energy balance.\n\nMajor Crystals:\n• Quartz - Purity and Clarity\n• Amethyst - Peace and Spirituality\n• Rose Quartz - Love and Harmony\n• Jade - Fortune and Prosperity\n\nWays to Use:\n1. Wear it\n2. Meditate with it\n3. Place it at home\n4. Chakra Balancing`,
      hi: `क्रिस्टल हीलिंग एक प्राचीन उपचार पद्धति है जो ऊर्जा के संतुलन पर आधारित है।\n\nप्रमुख क्रिस्टल:\n• क्वार्ट्ज - शुद्धि और स्पष्टता\n• एमेथिस्ट - शांति और आध्यात्मिकता\n• रोज क्वार्ट्ज - प्रेम और सद्भाव\n• जेड - सौभाग्य और समृद्धि\n\nउपयोग के तरीके:\n1. पहनने के लिए\n2. ध्यान में\n3. घर में स्थापना\n4. चक्र संतुलन`,
      es: `La curación con cristal es una terapia antigua basada en el equilibrio de energía.\n\nPiedras principales:\n• Cuarzo - Piedra pura y clara\n• Ámbar - Piedra de Júpiter\n• Rubí - Piedra del Sol\n• Esmeralda - Piedra de Mercurio\n\nCómo usarlo:\n1. Usarlo como joya\n2. Meditar con él\n3. Colocarlo en casa\n4. Equilibrio de Chakras`,
      fr: `La guérison cristalline est une thérapie ancienne basée sur l'équilibre énergétique.\n\nPierres principales :\n• Quartz - Pierre pure et claire\n• Améthyste - Pierre de paix et spiritualité\n• Rose Quartz - Pierre d'amour et harmonie\n• Jade - Pierre de fortune et prospérité\n\nMoyens d'utilisation :\n1. L'en porter\n2. Méditer avec lui\n3. Le placer à la maison\n4. Équilibre des chakras`,
      de: `Kristallheilung ist eine alte Therapie, die auf Energiegleichgewicht basiert.\n\nHauptsteine :\n• Quarz - Reinheit und Klarheit\n• Amethyst - Frieden und Spiritualität\n• Rosenquarz - Liebe und Harmonie\n• Jade - Glück und Wohlstand\n\nMöglichkeiten, es zu verwenden :\n1. Es als Schmuck tragen\n2. Es in der Meditation verwenden\n3. Es in Ihrem Zuhause platzieren\n4. Chakra-Gleichgewicht`,
      zh: `水晶治疗是一种基于能量平衡的古老疗法。\n\n主要水晶：\n• 石英 - 纯度和清晰度\n• 紫水晶 - 和平与精神\n• 粉晶 - 爱与和谐\n• 玉 - 财富与繁荣\n\n使用方法：\n1. 佩戴它\n2. 与它冥想\n3. 在家中放置它\n4. 气轮平衡`,
      ar: `العلاج بالكريستال هو تمرين صفحي قديم يعتمد على توازن الطاقة.\n\nالأحجار الكريمة الرئيسية:\n• الكوارتز - نقاء ووضوح\n• الأميرث - سلامة وروحية\n• الروز كوارتز - حب وتوازن\n• الياد - ثروة وتمويل\n\طرق الاستخدام:\n1. يرتديه\n2. استعماله في التأمل\n3. وضعه في المنزل\n4. توازن الشكرات`
    },
    imageUrl: "/images/blog/crystal-healing.jpg",
    themeColor: "#fca4a4",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Spiritual Healing"
  },
  "vastu-shastra-tips": {
    title: {
      en: "Vastu Shastra Tips",
      hi: "वास्तु शास्त्र के टिप्स",
      es: "Consejos de Vastu Shastra",
      fr: "Conseils de Vastu Shastra",
      de: "Vastu Shastra Tipps",
      zh: "风水学技巧",
      ar: "نصائح فاستو شاسترا",
      ru: "Советы по Васту Шастре"
    },
    description: {
      en: "Discover the ancient science of Vastu Shastra and learn how to harmonize your living spaces with cosmic energies for prosperity, health, and happiness.",
      hi: "वास्तु शास्त्र के प्राचीन विज्ञान की खोज करें और सीखें कि कैसे अपने रहने के स्थानों को ब्रह्मांडीय ऊर्जाओं के साथ सामंजस्य बिठाकर समृद्धि, स्वास्थ्य और खुशी प्राप्त करें।",
      es: "Descubre la antigua ciencia del Vastu Shastra y aprende a armonizar tus espacios de vida con energías cósmicas para la prosperidad, la salud y la felicidad.",
      fr: "Découvrez l'ancienne science du Vastu Shastra et apprenez à harmoniser vos espaces de vie avec les énergies cosmiques pour la prospérité, la santé et le bonheur.",
      de: "Entdecken Sie die alte Wissenschaft des Vastu Shastra und lernen Sie, wie Sie Ihre Lebensräume mit kosmischen Energien für Wohlstand, Gesundheit und Glück harmonisieren können.",
      zh: "探索古老的瓦斯塔学科学，学习如何将您的生活空间与宇宙能量协调，以获得繁荣、健康和幸福。",
      ar: "اكتشف العلم القديم لفاستو شاسترا وتعلم كيفية تنسيق مساحات حياتك مع الطاقات الكونية للازدهار والصحة والسعادة.",
      ru: "Откройте для себя древнюю науку Васту Шастра и научитесь гармонизировать свои жилые пространства с космическими энергиями для процветания, здоровья и счастья."
    },
    content: {
      en: `Discover the ancient science of Vastu Shastra and learn how to harmonize your living spaces with cosmic energies for prosperity, health, and happiness.\n\nMain Topics:\n• Five Elements and Their Balance\n• Eight Directions and Their Energies\n• Room Placement Guidelines\n• Vastu Remedies and Solutions\n• Practical Tips for Home and Office`,
      hi: `वास्तु शास्त्र के प्राचीन विज्ञान की खोज करें और सीखें कि कैसे अपने रहने के स्थानों को ब्रह्मांडीय ऊर्जाओं के साथ सामंजस्य बिठाकर समृद्धि, स्वास्थ्य और खुशी प्राप्त करें।\n\nमुख्य विषय:\n• पांच तत्व और उनका संतुलन\n• आठ दिशाएं और उनकी ऊर्जाएं\n• कमरे की स्थापना के दिशानिर्देश\n• वास्तु उपाय और समाधान\n• घर और कार्यालय के लिए व्यावहारिक सुझाव`,
      es: `Descubre la antigua ciencia del Vastu Shastra y aprende a armonizar tus espacios de vida con energías cósmicas para la prosperidad, la salud y la felicidad.\n\nTemas principales:\n• Cinco elementos y su equilibrio\n• Ocho direcciones y sus energías\n• Pautas de colocación de habitaciones\n• Remedios y soluciones de Vastu\n• Consejos prácticos para casa y oficina`,
      fr: `Découvrez l'ancienne science du Vastu Shastra et apprenez à harmoniser vos espaces de vie avec les énergies cosmiques pour la prospérité, la santé et le bonheur.\n\nThèmes principaux :\n• Cinq éléments et leur équilibre\n• Huit directions et leurs énergies\n• Directives de placement des pièces\n• Remèdes et solutions Vastu\n• Conseils pratiques pour la maison et le bureau`,
      de: `Entdecken Sie die alte Wissenschaft des Vastu Shastra und lernen Sie, wie Sie Ihre Lebensräume mit kosmischen Energien für Wohlstand, Gesundheit und Glück harmonisieren können.\n\nHauptthemen :\n• Fünf Elemente und ihr Gleichgewicht\n• Acht Richtungen und ihre Energien\n• Richtlinien für die Raumaufteilung\n• Vastu-Heilmittel und Lösungen\n• Praktische Tipps für Zuhause und Büro`,
      zh: `探索古老的瓦斯塔学科学，学习如何将您的生活空间与宇宙能量协调，以获得繁荣、健康和幸福。\n\n主要主题：\n• 五大元素及其平衡\n• 八个方向及其能量\n• 房间布置指南\n• 瓦斯塔疗法和解决方案\n• 家庭和办公室的实用技巧`,
      ar: `اكتشف العلم القديم لفاستو شاسترا وتعلم كيفية تنسيق مساحات حياتك مع الطاقات الكونية للازدهار والصحة والسعادة.\n\nالمواضيع الرئيسية:\n• خمسة عناصر وتوازنها\n• ثمانية اتجاهات وطاقاتها\n• إرشادات تنسيق الغرف\n• علاجات وحلول فاستو\n• نصائح عملية للمنزل والمكتب`,
      ru: `Откройте для себя древнюю науку Васту Шастра и научитесь гармонизировать свои жилые пространства с космическими энергиями для процветания, здоровья и счастья.\n\nОсновные темы:\n• Пять элементов и их баланс\n• Восемь направлений и их энергии\n• Руководство по размещению комнат\n• Средства и решения Васту\n• Практические советы для дома и офиса`
    },
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1753079524/Vastu_Shastra_f0haqy.jpg",
    themeColor: "#34d399",
    author: {
      en: "Dr. Narendra Kumar Sharma",
      hi: "डॉ. नरेंद्र कुमार शर्मा",
      es: "Dr. Narendra Kumar Sharma",
      fr: "Dr Narendra Kumar Sharma",
      de: "Dr. Narendra Kumar Sharma",
      zh: "纳伦德拉·库马尔·沙尔马博士",
      ar: "الدكتور ناريندرا كومار شارما",
      ru: "Др. Нарендра Кумар Шарма"
    },
    date: "2024-04-15",
    category: "Vastu Shastra"
  },
  
   
  }
