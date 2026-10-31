/*
  «Игровой стол» · слова и карточки для игр из table-party.js (2.4.26).

  Итоговая форма (её читают игры):
    window.GLOWLETTER_TABLE_CONTENT = {
      explain: { ru: [...], en: [...], fr: [...] },   // «Объясни слово»
      sketch:  { ru: [...], en: [...], fr: [...] },   // «Угадай рисунок» — только то, что легко нарисовать
      talk:    { ru: [{ c: "childhood", t: "…" }, …], en: […], fr: […] }  // «О чём поговорить»
    };

  Здесь строки записаны тройками «ru|en|fr», чтобы перевод стоял рядом с оригиналом.
  Другие языки можно добавить отдельными массивами: GLOWLETTER_TABLE_CONTENT.explain.de = [...].
  Если языка нет, игры берут английский.

  Важно для talk: карточки на всех языках идут в ОДНОМ порядке (одна и та же карточка
  под одним номером), потому что друзья с разными языками видят карточку по номеру.
  Категории: childhood, travel, food, dreams, whatif, funny.

  Правила текстов: ничего романтического, без 18+, насилия, религии, политики и алкоголя;
  без «мелодия/песня/музыка» и «обожаю»; по-русски обращаемся на «вы» — прошедшее время
  во множественном числе не выдаёт пол.
*/
(() => {
  "use strict";

  const rows = text => text.split("\n").map(line => line.trim()).filter(Boolean).map(line => line.split("|").map(part => part.trim()));
  const columns = (list, langs, offset = 0) => Object.fromEntries(langs.map((lang, index) => [lang, list.map(row => row[index + offset])]));

  const EXPLAIN = rows(`
    яблоко|apple|pomme
    банан|banana|banane
    хлеб|bread|pain
    сыр|cheese|fromage
    суп|soup|soupe
    блины|pancakes|crêpes
    мороженое|ice cream|glace
    шоколад|chocolate|chocolat
    мёд|honey|miel
    морковь|carrot|carotte
    картошка|potato|pomme de terre
    помидор|tomato|tomate
    огурец|cucumber|concombre
    арбуз|watermelon|pastèque
    лимон|lemon|citron
    апельсин|orange|orange
    клубника|strawberry|fraise
    вишня|cherry|cerise
    виноград|grapes|raisin
    груша|pear|poire
    персик|peach|pêche
    ананас|pineapple|ananas
    кокос|coconut|noix de coco
    рис|rice|riz
    макароны|pasta|pâtes
    пицца|pizza|pizza
    бутерброд|sandwich|sandwich
    салат|salad|salade
    сливочное масло|butter|beurre
    яйцо|egg|œuf
    молоко|milk|lait
    чай|tea|thé
    кофе|coffee|café
    сок|juice|jus
    торт|cake|gâteau
    печенье|biscuit|biscuit
    конфета|sweet|bonbon
    варенье|jam|confiture
    каша|porridge|bouillie
    омлет|omelette|omelette
    попкорн|popcorn|pop-corn
    орехи|nuts|noix
    гриб|mushroom|champignon
    лук|onion|oignon
    чеснок|garlic|ail
    соль|salt|sel
    сахар|sugar|sucre
    мука|flour|farine
    йогурт|yogurt|yaourt
    пирог|pie|tarte
    пельмени|dumplings|raviolis
    картофель фри|chips|frites
    лимонад|lemonade|limonade
    горячий шоколад|hot chocolate|chocolat chaud
    завтрак|breakfast|petit-déjeuner
    обед|lunch|déjeuner
    ужин|dinner|dîner
    пикник|picnic|pique-nique
    рецепт|recipe|recette
    солнце|sun|soleil
    луна|moon|lune
    звезда|star|étoile
    облако|cloud|nuage
    дождь|rain|pluie
    снег|snow|neige
    ветер|wind|vent
    гром|thunder|tonnerre
    радуга|rainbow|arc-en-ciel
    река|river|rivière
    озеро|lake|lac
    море|sea|mer
    океан|ocean|océan
    гора|mountain|montagne
    лес|forest|forêt
    пустыня|desert|désert
    остров|island|île
    водопад|waterfall|cascade
    вулкан|volcano|volcan
    пещера|cave|grotte
    пляж|beach|plage
    песок|sand|sable
    камень|stone|pierre
    лист|leaf|feuille
    дерево|tree|arbre
    трава|grass|herbe
    подсолнух|sunflower|tournesol
    сосулька|icicle|glaçon
    туман|fog|brouillard
    рассвет|sunrise|lever du soleil
    закат|sunset|coucher du soleil
    небо|sky|ciel
    поле|field|champ
    сад|garden|jardin
    лужа|puddle|flaque
    град|hail|grêle
    гроза|thunderstorm|orage
    молния|lightning|éclair
    мороз|frost|gel
    жара|heatwave|canicule
    листопад|falling leaves|chute des feuilles
    ракушка|seashell|coquillage
    волна|wave|vague
    кошка|cat|chat
    собака|dog|chien
    лошадь|horse|cheval
    корова|cow|vache
    овца|sheep|mouton
    коза|goat|chèvre
    кролик|rabbit|lapin
    ёж|hedgehog|hérisson
    белка|squirrel|écureuil
    лиса|fox|renard
    волк|wolf|loup
    медведь|bear|ours
    слон|elephant|éléphant
    жираф|giraffe|girafe
    лев|lion|lion
    тигр|tiger|tigre
    обезьяна|monkey|singe
    зебра|zebra|zèbre
    кенгуру|kangaroo|kangourou
    пингвин|penguin|pingouin
    сова|owl|chouette
    попугай|parrot|perroquet
    орёл|eagle|aigle
    утка|duck|canard
    курица|hen|poule
    рыба|fish|poisson
    кит|whale|baleine
    дельфин|dolphin|dauphin
    черепаха|turtle|tortue
    лягушка|frog|grenouille
    улитка|snail|escargot
    бабочка|butterfly|papillon
    пчела|bee|abeille
    муравей|ant|fourmi
    верблюд|camel|chameau
    олень|deer|cerf
    мышь|mouse|souris
    хомяк|hamster|hamster
    панда|panda|panda
    коала|koala|koala
    осьминог|octopus|pieuvre
    краб|crab|crabe
    павлин|peacock|paon
    фламинго|flamingo|flamant rose
    щенок|puppy|chiot
    котёнок|kitten|chaton
    аквариум|aquarium|aquarium
    паук|spider|araignée
    паутина|cobweb|toile d’araignée
    комар|mosquito|moustique
    светлячок|firefly|luciole
    гусеница|caterpillar|chenille
    стрекоза|dragonfly|libellule
    морж|walrus|morse
    енот|raccoon|raton laveur
    бобёр|beaver|castor
    дятел|woodpecker|pic-vert
    воробей|sparrow|moineau
    голубь|pigeon|pigeon
    лебедь|swan|cygne
    снежинка|snowflake|flocon de neige
    сугроб|snowdrift|congère
    каштан|chestnut|châtaigne
    жёлудь|acorn|gland
    кактус|cactus|cactus
    пальма|palm tree|palmier
    одуванчик|dandelion|pissenlit
    ромашка|daisy|marguerite
    тюльпан|tulip|tulipe
    стул|chair|chaise
    стол|table|table
    лампа|lamp|lampe
    окно|window|fenêtre
    дверь|door|porte
    ключ|key|clé
    зонт|umbrella|parapluie
    часы|clock|horloge
    телефон|phone|téléphone
    компьютер|computer|ordinateur
    чашка|cup|tasse
    тарелка|plate|assiette
    ложка|spoon|cuillère
    вилка|fork|fourchette
    чайник|kettle|bouilloire
    холодильник|fridge|frigo
    духовка|oven|four
    зеркало|mirror|miroir
    расчёска|comb|peigne
    зубная щётка|toothbrush|brosse à dents
    мыло|soap|savon
    полотенце|towel|serviette
    очки|glasses|lunettes
    сумка|bag|sac
    рюкзак|backpack|sac à dos
    кошелёк|wallet|portefeuille
    монета|coin|pièce de monnaie
    ножницы|scissors|ciseaux
    карандаш|pencil|crayon
    ручка|pen|stylo
    тетрадь|notebook|cahier
    книга|book|livre
    газета|newspaper|journal
    конверт|envelope|enveloppe
    марка|stamp|timbre
    метла|broom|balai
    ведро|bucket|seau
    лестница|ladder|échelle
    молоток|hammer|marteau
    верёвка|rope|corde
    коробка|box|boîte
    корзина|basket|panier
    бутылка|bottle|bouteille
    банка|jar|bocal
    ваза|vase|vase
    ковёр|carpet|tapis
    диван|sofa|canapé
    полка|shelf|étagère
    стиральная машина|washing machine|machine à laver
    пылесос|vacuum cleaner|aspirateur
    утюг|iron|fer à repasser
    носок|sock|chaussette
    ботинок|shoe|chaussure
    сапоги|boots|bottes
    шапка|woolly hat|bonnet
    шарф|scarf|écharpe
    перчатки|gloves|gants
    куртка|jacket|veste
    пуговица|button|bouton
    карман|pocket|poche
    пульт|remote control|télécommande
    зарядка|charger|chargeur
    батарейка|battery|pile
    клавиатура|keyboard|clavier
    будильник|alarm clock|réveil
    кресло|armchair|fauteuil
    кастрюля|saucepan|casserole
    сковородка|frying pan|poêle
    фонарик|torch|lampe de poche
    велосипед|bicycle|vélo
    машина|car|voiture
    автобус|bus|bus
    поезд|train|train
    самолёт|plane|avion
    корабль|ship|navire
    лодка|boat|bateau
    вертолёт|helicopter|hélicoptère
    ракета|rocket|fusée
    трамвай|tram|tramway
    метро|metro|métro
    такси|taxi|taxi
    трактор|tractor|tracteur
    мост|bridge|pont
    дорога|road|route
    светофор|traffic light|feu tricolore
    карта|map|carte
    компас|compass|boussole
    чемодан|suitcase|valise
    билет|ticket|billet
    паспорт|passport|passeport
    палатка|tent|tente
    костёр|campfire|feu de camp
    воздушный змей|kite|cerf-volant
    воздушный шарик|balloon|ballon de baudruche
    мяч|ball|balle
    самокат|scooter|trottinette
    скейтборд|skateboard|skateboard
    аэропорт|airport|aéroport
    вокзал|railway station|gare
    пробка|traffic jam|embouteillage
    путешествие|journey|voyage
    сувенир|souvenir|souvenir
    открытка|postcard|carte postale
    отель|hotel|hôtel
    экскурсия|guided tour|visite guidée
    путеводитель|guidebook|guide de voyage
    фотоаппарат|camera|appareil photo
    бинокль|binoculars|jumelles
    глобус|globe|globe
    маяк|lighthouse|phare
    замок|castle|château
    фонтан|fountain|fontaine
    памятник|monument|monument
    небоскрёб|skyscraper|gratte-ciel
    паровоз|steam train|locomotive à vapeur
    кукла|doll|poupée
    пазл|jigsaw puzzle|puzzle
    шахматы|chess|échecs
    санки|sled|luge
    коньки|ice skates|patins à glace
    лыжи|skis|skis
    качели|swing|balançoire
    горка|slide|toboggan
    песочница|sandpit|bac à sable
    прятки|hide and seek|cache-cache
    настольная игра|board game|jeu de société
    мыльные пузыри|soap bubbles|bulles de savon
    снеговик|snowman|bonhomme de neige
    конструктор|building blocks|jeu de construction
    юла|spinning top|toupie
    плюшевый мишка|teddy bear|ours en peluche
    учитель|teacher|professeur
    домашнее задание|homework|devoirs
    доска|blackboard|tableau
    мел|chalk|craie
    линейка|ruler|règle
    ластик|rubber|gomme
    урок|lesson|leçon
    перемена|break time|récréation
    экзамен|exam|examen
    библиотека|library|bibliothèque
    алфавит|alphabet|alphabet
    калькулятор|calculator|calculatrice
    пенал|pencil case|trousse
    школьный автобус|school bus|bus scolaire
    первый день в школе|first day of school|rentrée scolaire
    каникулы|holidays|vacances
    выпускной|graduation|remise des diplômes
    контрольная|test|contrôle
    кухня|kitchen|cuisine
    ванная|bathroom|salle de bains
    балкон|balcony|balcon
    крыша|roof|toit
    гараж|garage|garage
    магазин|shop|magasin
    рынок|market|marché
    больница|hospital|hôpital
    аптека|pharmacy|pharmacie
    почта|post office|bureau de poste
    музей|museum|musée
    зоопарк|zoo|zoo
    парк|park|parc
    стадион|stadium|stade
    кинотеатр|cinema|cinéma
    театр|theatre|théâtre
    цирк|circus|cirque
    пекарня|bakery|boulangerie
    деревня|village|village
    город|city|ville
    ферма|farm|ferme
    детская площадка|playground|aire de jeux
    бассейн|swimming pool|piscine
    каток|ice rink|patinoire
    столовая|canteen|cantine
    лифт|lift|ascenseur
    врач|doctor|médecin
    повар|cook|cuisinier
    пилот|pilot|pilote
    водитель|driver|chauffeur
    пожарный|firefighter|pompier
    фермер|farmer|agriculteur
    пекарь|baker|boulanger
    художник|painter|peintre
    строитель|builder|maçon
    космонавт|astronaut|astronaute
    фотограф|photographer|photographe
    садовник|gardener|jardinier
    почтальон|postman|facteur
    парикмахер|hairdresser|coiffeur
    стоматолог|dentist|dentiste
    ветеринар|vet|vétérinaire
    учёный|scientist|scientifique
    изобретатель|inventor|inventeur
    экскурсовод|tour guide|guide
    спасатель|lifeguard|maître-nageur
    продавец|shop assistant|vendeur
    программист|programmer|programmeur
    переводчик|translator|traducteur
    библиотекарь|librarian|bibliothécaire
    архитектор|architect|architecte
    кондитер|pastry chef|pâtissier
    футбол|football|football
    баскетбол|basketball|basket
    теннис|tennis|tennis
    плавание|swimming|natation
    бег|running|course à pied
    рыбалка|fishing|pêche à la ligne
    вязание|knitting|tricot
    фотография|photography|photographie
    поход|hiking|randonnée
    волейбол|volleyball|volley
    гимнастика|gymnastics|gymnastique
    оригами|origami|origami
    настольный теннис|table tennis|ping-pong
    кроссворд|crossword|mots croisés
    рисование|drawing|dessin
    лепка|clay modelling|modelage
    скалолазание|climbing|escalade
    шашки|draughts|dames
    коллекция марок|stamp collection|collection de timbres
    садоводство|gardening|jardinage
    бадминтон|badminton|badminton
    хоккей|hockey|hockey
    серфинг|surfing|surf
    олимпийские игры|Olympic Games|Jeux olympiques
    медаль|medal|médaille
    кубок|trophy|coupe
    команда|team|équipe
    болельщик|fan|supporter
    свисток|whistle|sifflet
    чихать|to sneeze|éternuer
    смеяться|to laugh|rire
    шептать|to whisper|chuchoter
    прыгать|to jump|sauter
    плавать|to swim|nager
    летать|to fly|voler
    лазать|to climb|grimper
    бегать|to run|courir
    читать|to read|lire
    писать|to write|écrire
    рисовать|to draw|dessiner
    хлопать в ладоши|to clap|applaudir
    стучать в дверь|to knock on the door|frapper à la porte
    мыть посуду|to wash the dishes|faire la vaisselle
    подметать|to sweep|balayer
    гладить бельё|to do the ironing|repasser
    печь|to bake|cuire au four
    жарить|to fry|faire frire
    варить|to boil|faire bouillir
    резать|to slice|couper en tranches
    сажать дерево|to plant a tree|planter un arbre
    поливать цветы|to water the flowers|arroser les fleurs
    грести|to row|ramer
    шить|to sew|coudre
    строить|to build|construire
    копать|to dig|creuser
    фотографировать|to take a photo|prendre une photo
    собирать чемодан|to pack a suitcase|faire sa valise
    ждать|to wait|attendre
    свистеть|to whistle|siffler
    дрожать от холода|to shiver|grelotter
    моргать|to blink|cligner des yeux
    нюхать|to sniff|renifler
    жонглировать|to juggle|jongler
    чистить зубы|to brush your teeth|se brosser les dents
    завязывать шнурки|to tie your laces|lacer ses chaussures
    зевать|to yawn|bâiller
    кивать|to nod|hocher la tête
    улыбаться|to smile|sourire
    считать|to count|compter
    ловить|to catch|attraper
    кататься на коньках|to ice-skate|patiner
    пылесосить|to vacuum|passer l’aspirateur
    ремонтировать|to repair|réparer
    искать|to search|chercher
    опаздывать|to be late|être en retard
    просыпаться|to wake up|se réveiller
    торопиться|to hurry|se dépêcher
    загорать|to sunbathe|bronzer
    кататься на велосипеде|to ride a bike|faire du vélo
    день рождения|birthday|anniversaire
    летние каникулы|summer holidays|grandes vacances
    дождливый день|rainy day|jour de pluie
    фейерверк|fireworks|feu d’artifice
    бюро находок|lost property|objets trouvés
    отключение света|power cut|coupure de courant
    генеральная уборка|spring cleaning|grand ménage
    обеденный перерыв|lunch break|pause déjeuner
    прогноз погоды|weather forecast|météo
    солнечный ожог|sunburn|coup de soleil
    икота|hiccups|hoquet
    утро понедельника|Monday morning|lundi matin
    список покупок|shopping list|liste de courses
    очередь|queue|file d’attente
    песочный замок|sandcastle|château de sable
    карта сокровищ|treasure map|carte au trésor
    письмо в бутылке|message in a bottle|message dans une bouteille
    селфи|selfie|selfie
    пароль|password|mot de passe
    вайфай|wifi|wifi
    скриншот|screenshot|capture d’écran
    видеозвонок|video call|appel vidéo
    смайлик|emoji|émoji
    интернет-магазин|online shop|boutique en ligne
    выходные|weekend|week-end
    календарь|calendar|calendrier
    отпуск|vacation|congés
    новоселье|housewarming|pendaison de crémaillère
    сюрприз|surprise|surprise
    секрет|secret|secret
    ошибка|mistake|erreur
    удача|luck|chance
    привычка|habit|habitude
    терпение|patience|patience
    любопытство|curiosity|curiosité
    смелость|courage|courage
    тень|shadow|ombre
    эхо|echo|écho
    отражение|reflection|reflet
    гравитация|gravity|gravité
    тишина|silence|silence
    будущее|future|avenir
    приключение|adventure|aventure
    изобретение|invention|invention
    расстояние|distance|distance
    подарок|present|cadeau
    традиция|tradition|tradition
    хобби|hobby|passe-temps
    соревнование|competition|compétition
    рекорд|record|record
    дружба|friendship|amitié
    сосед|neighbour|voisin
    гость|guest|invité
    комплимент|compliment|compliment
    шутка|joke|blague
    загадка|riddle|devinette
    прозвище|nickname|surnom
    акцент|accent|accent
    словарь|dictionary|dictionnaire
    воображение|imagination|imagination
    идея|idea|idée
    воспоминание|memory|mémoire
    сон|dream|rêve
    время|time|temps
    весна|spring|printemps
    лето|summer|été
    осень|autumn|automne
    зима|winter|hiver
    утро|morning|matin
    вечер|evening|soir
    полночь|midnight|minuit
    грязь|mud|boue
    сквозняк|draught|courant d’air
    мурашки|goosebumps|chair de poule
    веснушки|freckles|taches de rousseur
    сладкоежка|sweet tooth|bec sucré
    жаворонок|early bird|lève-tôt
    домосед|homebody|casanier
    день без интернета|a day without internet|une journée sans internet
    зонтик от солнца|sunshade|parasol
    велосипедный шлем|bike helmet|casque de vélo
    тёплые носки|warm socks|chaussettes chaudes
    горячая ванна|hot bath|bain chaud
    свежий хлеб|fresh bread|pain frais
    утренняя зарядка|morning exercises|gym du matin
    семейный альбом|family album|album de famille
    долгая дорога|long road|longue route
    забытый зонт|forgotten umbrella|parapluie oublié
  `);

  const SKETCH = rows(`
    яблоко|apple|pomme
    банан|banana|banane
    груша|pear|poire
    вишня|cherry|cerise
    клубника|strawberry|fraise
    арбуз|watermelon|pastèque
    лимон|lemon|citron
    морковь|carrot|carotte
    гриб|mushroom|champignon
    помидор|tomato|tomate
    ананас|pineapple|ananas
    виноград|grapes|raisin
    яйцо|egg|œuf
    хлеб|bread|pain
    сыр|cheese|fromage
    торт|cake|gâteau
    мороженое|ice cream|glace
    пицца|pizza|pizza
    бутерброд|sandwich|sandwich
    печенье|biscuit|biscuit
    пончик|doughnut|beignet
    леденец|lollipop|sucette
    кекс|cupcake|muffin
    попкорн|popcorn|pop-corn
    тыква|pumpkin|citrouille
    кукуруза|corn|maïs
    перец|pepper|poivron
    лук|onion|oignon
    картошка|potato|pomme de terre
    кокос|coconut|noix de coco
    жёлудь|acorn|gland
    шишка|pine cone|pomme de pin
    каштан|chestnut|châtaigne
    чашка|cup|tasse
    заварочный чайник|teapot|théière
    кастрюля|saucepan|casserole
    тарелка|plate|assiette
    ложка|spoon|cuillère
    вилка|fork|fourchette
    бутылка|bottle|bouteille
    стакан|glass|verre
    солнце|sun|soleil
    луна|moon|lune
    звезда|star|étoile
    облако|cloud|nuage
    дождь|rain|pluie
    снежинка|snowflake|flocon
    радуга|rainbow|arc-en-ciel
    молния|lightning|éclair
    гора|mountain|montagne
    вулкан|volcano|volcan
    остров|island|île
    дерево|tree|arbre
    пальма|palm tree|palmier
    цветок|flower|fleur
    подсолнух|sunflower|tournesol
    тюльпан|tulip|tulipe
    кактус|cactus|cactus
    лист|leaf|feuille
    волна|wave|vague
    лужа|puddle|flaque
    кошка|cat|chat
    собака|dog|chien
    рыба|fish|poisson
    птица|bird|oiseau
    мышь|mouse|souris
    кролик|rabbit|lapin
    ёж|hedgehog|hérisson
    улитка|snail|escargot
    бабочка|butterfly|papillon
    пчела|bee|abeille
    паук|spider|araignée
    лягушка|frog|grenouille
    черепаха|turtle|tortue
    змея|snake|serpent
    слон|elephant|éléphant
    жираф|giraffe|girafe
    лев|lion|lion
    обезьяна|monkey|singe
    зебра|zebra|zèbre
    пингвин|penguin|pingouin
    сова|owl|hibou
    утка|duck|canard
    курица|hen|poule
    корова|cow|vache
    лошадь|horse|cheval
    овца|sheep|mouton
    кит|whale|baleine
    дельфин|dolphin|dauphin
    осьминог|octopus|pieuvre
    краб|crab|crabe
    медуза|jellyfish|méduse
    морская звезда|starfish|étoile de mer
    морской конёк|seahorse|hippocampe
    медведь|bear|ours
    лиса|fox|renard
    белка|squirrel|écureuil
    верблюд|camel|chameau
    кенгуру|kangaroo|kangourou
    крокодил|crocodile|crocodile
    динозавр|dinosaur|dinosaure
    гусеница|caterpillar|chenille
    попугай|parrot|perroquet
    павлин|peacock|paon
    фламинго|flamingo|flamant rose
    лебедь|swan|cygne
    жук|beetle|scarabée
    стрекоза|dragonfly|libellule
    гнездо|nest|nid
    перо|feather|plume
    ракушка|seashell|coquillage
    косточка|dog bone|os
    дом|house|maison
    замок|castle|château
    палатка|tent|tente
    маяк|lighthouse|phare
    мост|bridge|pont
    башня|tower|tour
    окно|window|fenêtre
    дверь|door|porte
    ключ|key|clé
    лестница|ladder|échelle
    забор|fence|clôture
    стул|chair|chaise
    стол|table|table
    лампа|lamp|lampe
    лампочка|light bulb|ampoule
    диван|sofa|canapé
    часы|clock|horloge
    будильник|alarm clock|réveil
    песочные часы|hourglass|sablier
    зонт|umbrella|parapluie
    очки|glasses|lunettes
    солнечные очки|sunglasses|lunettes de soleil
    шапка|woolly hat|bonnet
    кепка|cap|casquette
    корона|crown|couronne
    шарф|scarf|écharpe
    варежка|mitten|moufle
    носок|sock|chaussette
    сапог|boot|botte
    футболка|T-shirt|tee-shirt
    брюки|trousers|pantalon
    галстук|tie|cravate
    пуговица|button|bouton
    сумка|bag|sac
    рюкзак|backpack|sac à dos
    чемодан|suitcase|valise
    книга|book|livre
    карандаш|pencil|crayon
    ножницы|scissors|ciseaux
    линейка|ruler|règle
    конверт|envelope|enveloppe
    подарок|present|cadeau
    воздушный шарик|balloon|ballon de baudruche
    воздушный змей|kite|cerf-volant
    мяч|ball|ballon
    кукла|doll|poupée
    плюшевый мишка|teddy bear|ours en peluche
    робот|robot|robot
    ракета|rocket|fusée
    самолёт|plane|avion
    вертолёт|helicopter|hélicoptère
    машина|car|voiture
    автобус|bus|bus
    поезд|train|train
    велосипед|bicycle|vélo
    лодка|boat|bateau
    корабль|ship|navire
    трактор|tractor|tracteur
    грузовик|lorry|camion
    самокат|scooter|trottinette
    светофор|traffic light|feu tricolore
    якорь|anchor|ancre
    парус|sail|voile
    подводная лодка|submarine|sous-marin
    карта|map|carte
    фотоаппарат|camera|appareil photo
    телефон|phone|téléphone
    компьютер|computer|ordinateur
    телевизор|television|télévision
    батарейка|battery|pile
    молоток|hammer|marteau
    гвоздь|nail|clou
    пила|saw|scie
    кисточка|paintbrush|pinceau
    ведро|bucket|seau
    лопата|spade|pelle
    лейка|watering can|arrosoir
    цветочный горшок|flowerpot|pot de fleurs
    корзина|basket|panier
    метла|broom|balai
    снеговик|snowman|bonhomme de neige
    санки|sled|luge
    лыжи|skis|skis
    песочный замок|sandcastle|château de sable
    качели|swing|balançoire
    горка|slide|toboggan
    костёр|campfire|feu de camp
    удочка|fishing rod|canne à pêche
    кубок|trophy|coupe
    медаль|medal|médaille
    свисток|whistle|sifflet
    улыбка|smile|sourire
    глаз|eye|œil
    ухо|ear|oreille
    нос|nose|nez
    ладонь|hand|main
    зуб|tooth|dent
    след|footprint|empreinte
    комета|comet|comète
    планета|planet|planète
    телескоп|telescope|télescope
    зубная щётка|toothbrush|brosse à dents
    расчёска|comb|peigne
    зеркало|mirror|miroir
    ванна|bathtub|baignoire
    холодильник|fridge|frigo
    утюг|iron|fer à repasser
    почтовый ящик|letterbox|boîte aux lettres
    бумажный самолётик|paper plane|avion en papier
    юла|spinning top|toupie
    скейтборд|skateboard|skateboard
    ролики|roller skates|rollers
    шлем|helmet|casque
    теннисная ракетка|tennis racket|raquette de tennis
    парашют|parachute|parachute
    воздушный шар|hot-air balloon|montgolfière
    мельница|windmill|moulin à vent
    колодец|well|puits
    пугало|scarecrow|épouvantail
    фонтан|fountain|fontaine
    скамейка|bench|banc
    фонарь|street lamp|lampadaire
    домик на дереве|tree house|cabane dans un arbre
    иглу|igloo|igloo
    пирамида|pyramid|pyramide
    глобус|globe|globe
    лупа|magnifying glass|loupe
    сундук|treasure chest|coffre au trésor
    весы|scales|balance
    кран|tap|robinet
    улей|beehive|ruche
    паутина|cobweb|toile d’araignée
    облачко с дождём|rain cloud|nuage de pluie
  `);

  // Категория|ru|en|fr — по 26 карточек на каждую из шести тем, порядок одинаковый на всех языках.
  const TALK = rows(`
    childhood|Какая игра была у вас любимой в детстве?|What was your favourite game as a child?|Quel était votre jeu préféré quand vous étiez enfant ?
    childhood|Какое блюдо из детства вы бы с радостью съели прямо сейчас?|Which dish from your childhood would you happily eat right now?|Quel plat de votre enfance mangeriez-vous volontiers tout de suite ?
    childhood|Кем вы хотели стать, когда были маленькими?|What job did you dream of when you were little?|Quel métier rêviez-vous de faire dans votre enfance ?
    childhood|Какой мультфильм вы могли смотреть много раз подряд?|Which cartoon could you watch over and over again?|Quel dessin animé pouviez-vous regarder en boucle ?
    childhood|Какая игрушка была самой любимой?|What was your most treasured toy?|Quel était votre jouet préféré ?
    childhood|Какое самое яркое воспоминание о летних каникулах?|What is your brightest memory of the summer holidays?|Quel est votre plus beau souvenir de grandes vacances ?
    childhood|Чему вас научили бабушка или дедушка?|What did a grandparent teach you?|Qu’est-ce qu’un grand-parent vous a appris ?
    childhood|Какой предмет в школе давался легче всего?|Which school subject came easiest to you?|Quelle matière vous paraissait la plus facile à l’école ?
    childhood|Был ли у вас в детстве свой секретный уголок?|Did you have a secret hideout as a child?|Aviez-vous une cachette secrète quand vous étiez enfant ?
    childhood|Какую книгу вы любили слушать в детстве?|Which book did you love to have read aloud as a child?|Quel livre aimiez-vous qu’on vous lise quand vous étiez enfant ?
    childhood|Какое у вас было первое домашнее животное — или какое вы хотели?|What was your first pet, or which pet did you wish for?|Quel a été votre premier animal de compagnie, ou lequel rêviez-vous d’avoir ?
    childhood|Во что вы играли во дворе с другими детьми?|What games did you play outside with other children?|À quoi jouiez-vous dehors avec les autres enfants ?
    childhood|Какой запах сразу напоминает вам детство?|Which smell instantly takes you back to childhood?|Quelle odeur vous ramène aussitôt à l’enfance ?
    childhood|Что вы коллекционировали в детстве?|What did you collect as a child?|Que collectionniez-vous quand vous étiez enfant ?
    childhood|Какой самый смешной случай был у вас в школе?|What was the funniest thing that happened at your school?|Quelle est l’histoire la plus drôle de votre école ?
    childhood|Какой день в году вы ждали больше всего в детстве?|Which day of the year did you look forward to most as a child?|Quel jour de l’année attendiez-vous le plus quand vous étiez enfant ?
    childhood|Что вы любили строить или мастерить?|What did you love to build or make with your hands?|Qu’aimiez-vous construire ou fabriquer de vos mains ?
    childhood|Какое домашнее правило казалось вам в детстве самым странным?|Which house rule seemed strangest to you as a child?|Quelle règle de la maison vous semblait la plus étrange quand vous étiez enfant ?
    childhood|Какую сладость вы покупали на карманные деньги?|Which treat did you buy with your pocket money?|Quelle friandise achetiez-vous avec votre argent de poche ?
    childhood|Кто был вашим самым первым другом и чем вы занимались вместе?|Who was your very first friend and what did you do together?|Vous souvenez-vous de votre toute première amitié ? Que faisiez-vous ensemble ?
    childhood|Чего вы боялись в детстве, а теперь это смешно?|What were you afraid of as a child that seems funny now?|De quoi aviez-vous peur enfant qui vous fait sourire aujourd’hui ?
    childhood|Что вы любили делать на улице зимой?|What did you love doing outside in winter as a child?|Que préfériez-vous faire dehors en hiver quand vous étiez enfant ?
    childhood|Какие истории о вашем детстве рассказывают родные?|What stories does your family tell about your childhood?|Quelles histoires votre famille raconte-t-elle sur votre enfance ?
    childhood|Что вы умели делать лучше всех в классе?|What could you do better than anyone else in your class?|Que saviez-vous faire mieux que tout le monde dans votre classe ?
    childhood|Как выглядел ваш школьный рюкзак или пенал?|What did your school bag or pencil case look like?|À quoi ressemblait votre cartable ou votre trousse ?
    childhood|Какой подарок из детства запомнился больше всего?|Which present from your childhood do you remember most?|Quel cadeau de votre enfance vous a le plus marqué ?
    travel|В какую страну вы бы поехали прямо завтра?|Which country would you set off for tomorrow?|Dans quel pays partiriez-vous dès demain ?
    travel|Какое самое красивое место, где вы бывали?|What is the most beautiful place you have been to?|Quel est le plus bel endroit que vous ayez visité ?
    travel|Горы или море — и почему?|Mountains or the sea — and why?|Montagne ou mer — et pourquoi ?
    travel|Какой город вам хотелось бы увидеть ночью?|Which city would you like to see at night?|Quelle ville aimeriez-vous voir de nuit ?
    travel|Что вы всегда берёте с собой в дорогу?|What do you always take with you on a trip?|Qu’emportez-vous toujours en voyage ?
    travel|Поезд, самолёт или машина — как вы любите путешествовать?|Train, plane or car — how do you like to travel?|Train, avion ou voiture : comment aimez-vous voyager ?
    travel|Какую необычную еду вы пробовали в поездке?|What unusual food have you tried on a trip?|Quel plat étonnant avez-vous goûté en voyage ?
    travel|Какой сувенир из поездки вы храните до сих пор?|Which souvenir from a trip do you still keep?|Quel souvenir de voyage gardez-vous encore ?
    travel|Куда бы вы поехали, если бы на сборы был всего час?|Where would you go if you had only an hour to pack?|Où iriez-vous si vous n’aviez qu’une heure pour faire vos bagages ?
    travel|Какое место в вашем городе вы бы показали гостю первым?|Which place in your town would you show a guest first?|Quel endroit de votre ville montreriez-vous en premier à un invité ?
    travel|Какой язык вам хотелось бы выучить для путешествий?|Which language would you like to learn for travelling?|Quelle langue aimeriez-vous apprendre pour voyager ?
    travel|Палатка в лесу или отель с видом — что выберете?|A tent in the woods or a hotel with a view — which would you pick?|Une tente en forêt ou un hôtel avec vue : que choisiriez-vous ?
    travel|Какое самое долгое путешествие у вас было?|What is the longest journey you have made?|Quel est le plus long voyage que vous ayez fait ?
    travel|Что бы вы хотели увидеть: северное сияние, пустыню или джунгли?|What would you like to see: the northern lights, a desert or a jungle?|Que voudriez-vous voir : des aurores boréales, un désert ou une jungle ?
    travel|Что вам больше нравится в поездке: планы или сюрпризы?|On a trip, do you prefer plans or surprises?|En voyage, préférez-vous les plans ou les surprises ?
    travel|Что бы вы попробовали: воздушный шар, канатную дорогу или паром?|Which would you try: a hot-air balloon, a cable car or a ferry?|Lequel essaieriez-vous : une montgolfière, un téléphérique ou un ferry ?
    travel|Какое место из книги или фильма вы бы хотели посетить?|Which place from a book or film would you like to visit?|Quel lieu d’un livre ou d’un film aimeriez-vous visiter ?
    travel|Чем вы занимаетесь в долгой дороге?|What do you do to pass the time on a long journey?|Que faites-vous pendant un long trajet pour passer le temps ?
    travel|Какое место вы хотели бы увидеть с высоты?|Which place would you like to see from above?|Quel endroit aimeriez-vous voir d’en haut ?
    travel|Какую страну вы знаете по кухне, но ещё не видели?|Which country do you know from its food but have never visited?|Quel pays connaissez-vous par sa cuisine sans l’avoir visité ?
    travel|Где бы вы хотели встретить рассвет?|Where would you like to watch the sunrise?|Où aimeriez-vous regarder le lever du soleil ?
    travel|Что вы обычно забываете взять в поездку?|What do you usually forget to pack?|Qu’oubliez-vous souvent d’emporter en voyage ?
    travel|Какой самый маленький городок вам понравился?|What is the smallest town you have liked?|Quelle est la plus petite ville qui vous a plu ?
    travel|Если бы можно было пожить месяц в любом городе, какой бы вы выбрали?|If you could live in any city for a month, which would you choose?|Si vous pouviez vivre un mois dans n’importe quelle ville, laquelle choisiriez-vous ?
    travel|Какую поездку вы бы хотели повторить?|Which trip would you like to repeat?|Quel voyage aimeriez-vous refaire ?
    travel|Что интереснее: музеи или прогулки по улицам?|What is more interesting: museums or walking the streets?|Qu’est-ce qui est plus intéressant : les musées ou les balades dans les rues ?
    food|Какое блюдо вы готовите лучше всего?|Which dish do you cook best?|Quel plat cuisinez-vous le mieux ?
    food|Сладкий завтрак или солёный?|Sweet breakfast or savoury?|Petit-déjeuner sucré ou salé ?
    food|Какую еду вы могли бы есть каждый день?|What food could you eat every day?|Quel plat pourriez-vous manger tous les jours ?
    food|Какой фрукт вы любите больше всего?|What is your favourite fruit?|Quel est votre fruit préféré ?
    food|Какое блюдо вы никогда не пробовали, но хотите?|Which dish have you never tried but would like to?|Quel plat n’avez-vous jamais goûté mais aimeriez goûter ?
    food|Чай или кофе — и с чем?|Tea or coffee — and with what?|Thé ou café — et avec quoi ?
    food|Какой самый необычный вкус мороженого вы пробовали?|What is the most unusual ice cream flavour you have tried?|Quel est le parfum de glace le plus étonnant que vous ayez goûté ?
    food|Что бы вы приготовили для гостя из другой страны?|What would you cook for a guest from another country?|Que cuisineriez-vous pour un invité venu d’un autre pays ?
    food|Пицца, суп или салат: что выберете на обед?|Pizza, soup or salad: what would you choose for lunch?|Pizza, soupe ou salade : que choisiriez-vous pour le déjeuner ?
    food|Какой рецепт в вашей семье передаётся из поколения в поколение?|Which recipe has been passed down in your family?|Quelle recette se transmet dans votre famille ?
    food|Какая еда напоминает вам о доме?|Which food reminds you of home?|Quel plat vous rappelle la maison ?
    food|Что вы любите добавлять почти во всё?|What do you like to add to almost everything?|Qu’aimez-vous ajouter à presque tout ?
    food|Какую выпечку вы бы испекли вместе?|What would you like to bake together?|Quelle pâtisserie aimeriez-vous préparer ensemble ?
    food|Острое или совсем не острое?|Spicy food: yes or no?|Plutôt épicé ou pas du tout ?
    food|Какой перекус лучше всего брать в дорогу?|What is the best snack for a journey?|Quel est le meilleur en-cas pour un voyage ?
    food|Какое блюдо у вас однажды совсем не получилось?|Which dish once went completely wrong for you?|Quel plat avez-vous complètement raté un jour ?
    food|Какую кухню мира вы любите больше всего?|Which cuisine in the world do you like most?|Quelle cuisine du monde préférez-vous ?
    food|Что вкуснее: домашняя еда или еда в кафе?|What tastes better: home cooking or café food?|Qu’est-ce qui est meilleur : la cuisine maison ou celle du café ?
    food|Что вы пьёте, когда холодно?|What do you drink when it is cold?|Que buvez-vous quand il fait froid ?
    food|Какой ваш идеальный завтрак?|What is your ideal breakfast?|Quel est votre petit-déjeuner idéal ?
    food|Какую еду вы не любили в детстве, а теперь любите?|Which food did you dislike as a child but like now?|Quel aliment n’aimiez-vous pas enfant mais aimez aujourd’hui ?
    food|Если бы вы открыли кафе, что было бы в меню?|If you opened a café, what would be on the menu?|Si vous ouvriez un café, que mettriez-vous au menu ?
    food|Какой суп самый вкусный на свете?|What is the tastiest soup in the world?|Quelle est la meilleure soupe du monde ?
    food|Сколько ложек сахара вы кладёте в чай?|How many spoons of sugar do you put in your tea?|Combien de cuillères de sucre mettez-vous dans votre thé ?
    food|Какое блюдо вы хотели бы научиться готовить?|Which dish would you like to learn to cook?|Quel plat aimeriez-vous apprendre à cuisiner ?
    food|Шоколад: тёмный, молочный или белый?|Chocolate: dark, milk or white?|Chocolat : noir, au lait ou blanc ?
    dreams|Какому навыку вы хотели бы научиться в этом году?|Which skill would you like to learn this year?|Quelle compétence aimeriez-vous apprendre cette année ?
    dreams|Где бы вы хотели жить через десять лет?|Where would you like to live in ten years?|Où aimeriez-vous vivre dans dix ans ?
    dreams|Какой у вас самый большой план на лето?|What is your biggest plan for the summer?|Quel est votre grand projet pour l’été ?
    dreams|Дом мечты: у моря, в лесу или в городе?|Your dream home: by the sea, in the forest or in the city?|Votre maison de rêve : au bord de la mer, en forêt ou en ville ?
    dreams|На каком языке вы мечтаете говорить свободно?|Which language do you dream of speaking fluently?|Quelle langue rêvez-vous de parler couramment ?
    dreams|Чему бы вы хотели научить других?|What would you like to teach other people?|Qu’aimeriez-vous enseigner aux autres ?
    dreams|Какое доброе дело вы мечтаете сделать?|What good deed do you dream of doing?|Quelle bonne action rêvez-vous d’accomplir ?
    dreams|Какую вещь вы хотите сделать своими руками?|What would you like to make with your own hands?|Qu’aimeriez-vous fabriquer de vos propres mains ?
    dreams|Какой вид спорта вы хотели бы попробовать?|Which sport would you like to try?|Quel sport aimeriez-vous essayer ?
    dreams|Какое место на карте вы мечтаете увидеть?|Which place on the map do you dream of seeing?|Quel endroit sur la carte rêvez-vous de voir ?
    dreams|Если бы у вас был свободный год, чем бы вы его заполнили?|If you had a free year, how would you fill it?|Si vous aviez une année libre, comment la rempliriez-vous ?
    dreams|Какое растение или сад вы хотели бы вырастить?|What plant or garden would you like to grow?|Quelle plante ou quel jardin aimeriez-vous faire pousser ?
    dreams|Какую книгу вы мечтаете прочитать или написать?|Which book do you dream of reading or writing?|Quel livre rêvez-vous de lire ou d’écrire ?
    dreams|Какое умение из детства вы бы хотели вернуть?|Which childhood skill would you like to get back?|Quel talent d’enfance aimeriez-vous retrouver ?
    dreams|Какой рекорд вы хотели бы поставить?|What record would you like to set?|Quel record aimeriez-vous battre ?
    dreams|Что вы хотите успеть сделать до конца года?|What do you want to do before the end of the year?|Que voulez-vous faire avant la fin de l’année ?
    dreams|Каким был бы ваш идеальный выходной?|What would your perfect day off look like?|À quoi ressemblerait votre jour de repos idéal ?
    dreams|Какую профессию вы бы попробовали хотя бы на день?|Which job would you try for just one day?|Quel métier essaieriez-vous pour une seule journée ?
    dreams|Какое животное вы хотели бы когда-нибудь увидеть вживую?|Which animal would you like to see in real life one day?|Quel animal aimeriez-vous voir en vrai un jour ?
    dreams|Какой маленький шаг к мечте можно сделать на этой неделе?|What small step towards a dream could you take this week?|Quel petit pas vers un rêve pourriez-vous faire cette semaine ?
    dreams|Какую поездку вы бы спланировали вместе?|What trip would you plan together?|Quel voyage organiseriez-vous ensemble ?
    dreams|Чему вы хотели бы научиться друг у друга?|What would you like to learn from each other?|Qu’aimeriez-vous vous apprendre mutuellement ?
    dreams|Какой проект вы давно хотите начать?|Which project have you wanted to start for a long time?|Quel projet voulez-vous commencer depuis longtemps ?
    dreams|Где бы вы хотели провести один день в полной тишине?|Where would you like to spend a whole quiet day?|Où aimeriez-vous passer une journée entière au calme ?
    dreams|Какую встречу вы бы устроили для всех друзей?|What get-together would you organise for all your friends?|Quelle rencontre organiseriez-vous pour tous vos amis ?
    dreams|Что бы вы изобрели, чтобы облегчить жизнь?|What would you invent to make life easier?|Qu’inventeriez-vous pour faciliter la vie ?
    whatif|Если бы вы могли летать, куда бы отправились первым делом?|If you could fly, where would you go first?|Si vous pouviez voler, où iriez-vous en premier ?
    whatif|Если бы животные умели говорить, с кем бы вы поговорили?|If animals could talk, which one would you chat with?|Si les animaux parlaient, avec lequel discuteriez-vous ?
    whatif|Если бы можно было стать невидимкой на день, что бы вы сделали?|If you could be invisible for a day, what would you do?|Si vous pouviez être invisible pendant une journée, que feriez-vous ?
    whatif|Если бы можно было выбрать любой талант, какой бы вы взяли?|If you could pick any talent, which would you choose?|Si vous pouviez choisir n’importe quel talent, lequel prendriez-vous ?
    whatif|Если бы вы жили в книге, то в какой?|If you lived inside a book, which one would it be?|Si vous viviez dans un livre, lequel serait-ce ?
    whatif|Если бы у вас был робот-помощник, что бы он делал?|If you had a robot helper, what would it do?|Si vous aviez un robot assistant, que ferait-il ?
    whatif|Если бы вы говорили на всех языках, с кем бы вы поговорили?|If you spoke every language, who would you talk to?|Si vous parliez toutes les langues, avec qui discuteriez-vous ?
    whatif|Если бы можно было прямо сейчас перенестись в любое время года, какое бы вы выбрали?|If you could jump into any season right now, which would it be?|Si vous pouviez sauter dans n’importe quelle saison maintenant, laquelle choisiriez-vous ?
    whatif|Если бы у вас был свой остров, что бы там было?|If you had your own island, what would be on it?|Si vous aviez votre propre île, qu’y aurait-il dessus ?
    whatif|Если бы вы уменьшились до размера муравья, что бы вы исследовали?|If you shrank to the size of an ant, what would you explore?|Si vous deveniez minuscule comme une fourmi, qu’exploreriez-vous ?
    whatif|Если бы можно было придумать новый особенный день в году, каким бы он был?|If you could invent a new special day of the year, what would it be like?|Si vous pouviez inventer une nouvelle journée spéciale dans l’année, comment serait-elle ?
    whatif|Если бы день можно было перемотать, какой момент вы бы повторили?|If you could rewind your day, which moment would you replay?|Si vous pouviez rembobiner votre journée, quel moment revivriez-vous ?
    whatif|Если бы вы были погодой, то какой?|If you were a kind of weather, which would you be?|Si vous étiez une météo, laquelle seriez-vous ?
    whatif|Если бы можно было жить под водой, что бы вы там построили?|If you could live under water, what would you build there?|Si vous pouviez vivre sous l’eau, qu’y construiriez-vous ?
    whatif|Если бы можно было поменяться профессиями на день, то с кем?|If you could swap jobs with someone for a day, who would it be?|Si vous pouviez échanger de métier pendant une journée, avec qui ?
    whatif|Если бы у вас был свой музей, что бы в нём хранилось?|If you had your own museum, what would be in it?|Si vous aviez votre propre musée, qu’y exposeriez-vous ?
    whatif|Если бы вы могли поговорить с растениями, что бы вы спросили?|If you could talk to plants, what would you ask them?|Si vous pouviez parler aux plantes, que leur demanderiez-vous ?
    whatif|Если бы все машины исчезли на день, куда бы вы пошли пешком?|If all cars vanished for a day, where would you walk?|Si toutes les voitures disparaissaient pour une journée, où iriez-vous à pied ?
    whatif|Если бы вы были вкусом мороженого, то каким?|If you were an ice cream flavour, which one would you be?|Si vous étiez un parfum de glace, lequel seriez-vous ?
    whatif|Если бы можно было прожить один день в другой стране, где?|If you could spend one day living in another country, where would it be?|Si vous pouviez vivre une journée dans un autre pays, lequel choisiriez-vous ?
    whatif|Если бы у вашего дома были колёса, куда бы вы поехали?|If your house had wheels, where would you drive it?|Si votre maison avait des roues, où iriez-vous ?
    whatif|Если бы вы открыли свой магазин, что бы там продавалось?|If you opened your own shop, what would it sell?|Si vous ouvriez votre propre boutique, que vendriez-vous ?
    whatif|Если бы снег шёл каждый день, что бы изменилось?|If it snowed every day, what would change?|S’il neigeait tous les jours, qu’est-ce qui changerait ?
    whatif|Если бы у вас была машина времени на один час, куда бы вы отправились?|If you had a time machine for one hour, where would you go?|Si vous aviez une machine à remonter le temps pour une heure, où iriez-vous ?
    whatif|Если бы можно было научить питомца одному трюку, то какому?|If you could teach a pet one trick, what would it be?|Si vous pouviez apprendre un tour à un animal, lequel ?
    whatif|Если бы вы написали книгу, как бы она называлась?|If you wrote a book, what would it be called?|Si vous écriviez un livre, quel en serait le titre ?
    funny|Какая самая смешная ошибка автозамены у вас была?|What is the funniest autocorrect mistake you have had?|Quelle est la correction automatique la plus drôle qui vous soit arrivée ?
    funny|Какое слово вы долго произносили неправильно?|Which word did you pronounce wrong for a long time?|Quel mot avez-vous longtemps mal prononcé ?
    funny|Какой самый странный сон вам снился?|What is the strangest dream you have had?|Quel est le rêve le plus étrange que vous ayez fait ?
    funny|Что вас всегда смешит, даже когда нельзя?|What always makes you laugh, even when you shouldn’t?|Qu’est-ce qui vous fait toujours rire, même quand il ne faut pas ?
    funny|Какая самая нелепая покупка у вас была?|What is the silliest thing you have ever bought?|Quel est l’achat le plus absurde que vous ayez fait ?
    funny|Какое животное, по-вашему, самое смешное?|Which animal do you think is the funniest?|Selon vous, quel animal est le plus drôle ?
    funny|Расскажите о случае, когда всё пошло не по плану, но вышло весело.|Tell about a time when nothing went to plan but it turned out fun.|Racontez une fois où rien ne s’est passé comme prévu, mais c’était drôle.
    funny|Какую шутку вы знаете наизусть?|Which joke do you know by heart?|Quelle blague connaissez-vous par cœur ?
    funny|Как бы назывался мультфильм о вашей жизни?|What would a cartoon about your life be called?|Comment s’appellerait un dessin animé sur votre vie ?
    funny|Какую смешную привычку вы за собой замечали?|What funny habit have you noticed in yourself?|Quelle drôle d’habitude avez-vous remarquée chez vous ?
    funny|Какое самое смешное прозвище вам давали?|What is the funniest nickname you have been given?|Quel est le surnom le plus drôle qu’on vous ait donné ?
    funny|Если бы кошка или собака вели блог, о чём бы он был?|If a cat or a dog had a blog, what would it be about?|Si un chat ou un chien tenait un blog, de quoi parlerait-il ?
    funny|Какой фильм рассмешил вас до слёз?|Which film made you laugh until you cried?|Quel film vous a fait rire aux larmes ?
    funny|Что смешного случалось с вами в транспорте?|What funny thing has happened to you on public transport?|Que vous est-il arrivé de drôle dans les transports ?
    funny|Какое самое странное сочетание еды вам нравится?|What is the weirdest food combination you like?|Quel est le mélange d’aliments le plus bizarre que vous aimez ?
    funny|Каким звуком можно описать ваше утро?|What sound best describes your mornings?|Quel bruit décrirait le mieux vos matins ?
    funny|Какую вещь вы искали, а она была у вас в руке?|What have you searched for while holding it in your hand?|Qu’avez-vous déjà cherché alors que vous l’aviez dans la main ?
    funny|Какой смешной случай был у вас из-за погоды?|What funny weather story do you have?|Avez-vous une histoire drôle liée à la météo ?
    funny|Если бы у овощей был характер, кто был бы главным ворчуном?|If vegetables had personalities, which would be the grumpiest?|Si les légumes avaient un caractère, lequel serait le plus grognon ?
    funny|Какое самое смешное слово на другом языке вы знаете?|What is the funniest word you know in another language?|Quel est le mot le plus drôle que vous connaissez dans une autre langue ?
    funny|Что вы делали, когда думали, что никто не видит?|What have you done thinking nobody was watching?|Qu’avez-vous fait en pensant que personne ne regardait ?
    funny|Какую смешную фразу часто говорят у вас дома?|What funny phrase is often said in your home?|Quelle phrase drôle dit-on souvent chez vous ?
    funny|Как бы вас описала ваша тарелка после обеда?|How would your plate describe you after lunch?|Comment votre assiette vous décrirait-elle après le déjeuner ?
    funny|Какое ваше самое неудачное фото?|What is your most unfortunate photo?|Quelle est votre photo la plus ratée ?
    funny|Какую совсем бесполезную суперспособность вы бы выбрали?|Which totally useless superpower would you choose?|Quel super-pouvoir complètement inutile choisiriez-vous ?
    funny|Если бы у вашего утра был заголовок, то какой?|If your morning had a headline, what would it be?|Si votre matinée avait un titre de journal, lequel serait-ce ?
  `);

  const LANGS = ["ru", "en", "fr"];
  const content = window.GLOWLETTER_TABLE_CONTENT || {};
  content.explain = Object.assign(columns(EXPLAIN, LANGS), content.explain || {});
  content.sketch = Object.assign(columns(SKETCH, LANGS), content.sketch || {});
  content.talk = Object.assign(Object.fromEntries(LANGS.map((lang, index) => [lang, TALK.map(row => ({ c: row[0], t: row[index + 1] }))])), content.talk || {});
  window.GLOWLETTER_TABLE_CONTENT = content;
})();
