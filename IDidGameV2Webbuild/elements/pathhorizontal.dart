import 'package:polymer/polymer.dart';
import 'dart:html';
import 'dart:math';
import 'signsmall.dart';

/**
 * A Polymer click counter element.
 */
@CustomTag('path-horizontal')
class PathHorizontal extends PolymerElement with ChangeNotifier  {
  @reflectable @published String get tag => __$tag; String __$tag = ""; @reflectable set tag(String value) { __$tag = notifyPropertyChange(#tag, __$tag, value); }

  static num initVillagerCount = 100;

  static DivElement masterDiv;
  static ImageElement spriteImage;
  static List<CanvasRenderingContext2D> contexts = new List<CanvasRenderingContext2D>();
  static List<Villager> villagers = new List<Villager>();
  static int lastVillagerCount = 0;

  static List<Villager> selectedVillagers = new List<Villager>();

  static WinConditions conditions = new WinConditions();
  static WinCondition currentWinCondition;

  static int score = 0;
  static int tempScore = 0;
  static int level = 0;

  static PathHorizontal mainInstance;
  @reflectable @observable WinCondition get instanceCondition => __$instanceCondition; WinCondition __$instanceCondition; @reflectable set instanceCondition(WinCondition value) { __$instanceCondition = notifyPropertyChange(#instanceCondition, __$instanceCondition, value); }
  @reflectable @observable String get instanceScoreText => __$instanceScoreText; String __$instanceScoreText = ""; @reflectable set instanceScoreText(String value) { __$instanceScoreText = notifyPropertyChange(#instanceScoreText, __$instanceScoreText, value); }

  static SignSmall scoreSign, conditionSign;

  PathHorizontal.created() : super.created() {
    if (spriteImage == null) {
      masterDiv = this.$["pathdiv"];

      scoreSign = this.$["scoreSign"];
      conditionSign = this.$["conditionSign"];

      spriteImage = new ImageElement(src: "images/Sprites.png");
      spriteImage.onLoad.listen((e) {
        for (int i = 0; i < initVillagerCount; i++) {
          villagers.add(new Villager());
        }

        currentWinCondition = conditions.getRand(level);

        String localScore = window.localStorage["IDGScore"];
        score = localScore == null ? 0 : int.parse(localScore);
        String localLevel = window.localStorage["IDGLevel"];
        level = localLevel == null ? 0 : int.parse(localLevel);

        mainInstance = this;
        setInstanceVars();

        work(0.0);
      });
    } else {
      (this.$['scoreSign'] as HtmlElement).style.visibility = "hidden";
      (this.$['conditionSign'] as HtmlElement).style.visibility = "hidden";
    }

    CanvasElement canvas = this.$["pathcanvas"];
    CanvasRenderingContext2D context = canvas.getContext("2d");
    contexts.add(context);
    canvas.onClick.listen((e) => clicked(e, context));
  }

  static double lastTime = 0.0;
  static work(double time) {

    if (lastVillagerCount != villagers.length) orderVillagers();

    for (Villager v in villagers) {
      v.update();
    }

    for (CanvasRenderingContext2D context in contexts) {
      context.canvas.width = masterDiv.clientWidth;
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    for (Villager v in villagers) {
      v.draw();
    }

    window.animationFrame.then(work);
  }

  static clicked(MouseEvent e, CanvasRenderingContext2D context) {
    List<Villager> clicked = villagers.where((v) => v.context == context && e.offset.x > v.destX && e.offset.x < v.destX + Villager.spriteSize && e.offset.y > v.destY && e.offset.y < v.destY + Villager.spriteSize).toList();

    if (clicked.length > 0) {
      clicked.sort((a, b) => b.destY.compareTo(a.destY));
      clicked[0].setState(VillagerState.clicked);
    }
  }

  static orderVillagers() {
    villagers.sort((a, b) => a.destY.compareTo(b.destY));
    lastVillagerCount = villagers.length;
  }

  static addSelected(Villager v) {

    selectedVillagers.add(v);

    if (selectedVillagers.length > currentWinCondition.characterCount) {
      selectedVillagers[0].setState(VillagerState.walking);
    }

    if (selectedVillagers.length == currentWinCondition.characterCount) {
      checkWinCondition();
    }
  }

  static checkWinCondition() {
    if (currentWinCondition.checkCondition()) {
      for (int i = selectedVillagers.length - 1; i >= 0; i--) {
        selectedVillagers[i].setState(VillagerState.jumping);
      }

      score += (currentWinCondition.difficulty + 1) * 5;
      tempScore += 1;

      if (tempScore > 5 + level) {
        level += 1;
        tempScore = 0;
      }

      currentWinCondition = conditions.getRand(level);

      setInstanceVars();
    }
  }

  static setInstanceVars() {
    mainInstance.instanceCondition = currentWinCondition;
    mainInstance.instanceScoreText = "Level:" + level.toString() + " Score:" + score.toString();
    window.localStorage["IDGScore"] = score.toString();
    window.localStorage["IDGLevel"] = level.toString();
  }
}

class Villager {
  static Characters characters = new Characters();
  static const int spriteSize = 32;
  static const num stepSize = 8;
  static const num clickedDuration = 100;
  static Random rand = new Random();

  num sourceX, sourceY;
  num destX, destY;
  CanvasRenderingContext2D context;

  Character character;
  num speed = 1;
  int direction = 0;
  int state = 0;

  num stepLength = 0;
  num step = 0;

  num stateMisc = 0;
  num counter = 0;


  Villager() {
    this.destX = rand.nextInt(PathHorizontal.masterDiv.clientWidth);
    this.destY = 10 + rand.nextInt(26);

    this.setRands();

    this.speed = rand.nextBool() ? this.speed : -this.speed;

    this.updateDirection();
  }

  setRands() {
    this.speed = rand.nextDouble() * 0.5 + 0.3;

    context = PathHorizontal.contexts[rand.nextInt(PathHorizontal.contexts.length)];

    this.character = characters.getRand();
    this.updateSource();
  }

  updateSource() {
    this.sourceX = (this.character.spriteX + this.step) * spriteSize;
    this.sourceY = (this.character.spriteY + this.direction) * spriteSize;
  }

  updateDirection() {
    if (this.speed > 0) {
      this.direction = Direction.right;
    } else {
      this.direction = Direction.left;
    }
  }

  update() {
    switch (this.state) {
      case VillagerState.walking:
        this.destX += this.speed;

        if (this.destX < -50 && this.speed < 0) {
          this.setRands();
          this.updateDirection();
        }
        if (this.destX > PathHorizontal.masterDiv.clientWidth + 50 && this.speed > 0) {
          this.setRands();
          this.speed = -this.speed;
          this.updateDirection();
        }

        this.stepLength += this.speed.abs();
        if (this.stepLength > stepSize) {
          this.stepLength = 0;
          this.step = this.step == 0 ? 1 : 0;
        }

        this.updateSource();
        break;
      case VillagerState.clicked:
        this.counter++;

        if (this.counter >= clickedDuration) {
          this.setState(VillagerState.walking);
        }
        break;
      case VillagerState.jumping:
        this.counter++;

        if (this.counter == 8) {
          if (stateMisc < 4) {
            this.direction = Direction.getNextClockwise(this.direction);
          } else {
            this.direction = Direction.down;

          }
          this.updateSource();
          this.counter = 0;
          this.stateMisc++;
        } else {
          if (this.stateMisc == 4) this.destY--; else if (this.stateMisc == 5) this.destY++;
        }

        if (stateMisc == 6) {
          this.setState(VillagerState.walking);
        }

        break;
    }
  }

  bool setState(int newState) {
    switch (newState) {
      case VillagerState.walking:
        break;
      case VillagerState.clicked:
        if (this.state != VillagerState.walking) return false;
        break;
      case VillagerState.jumping:
        break;
    }

    this.state = newState;

    switch (newState) {
      case VillagerState.walking:
        PathHorizontal.selectedVillagers.remove(this);
        this.updateDirection();
        break;
      case VillagerState.clicked:
        this.counter = 0;
        this.direction = Direction.down;
        this.updateSource();
        PathHorizontal.addSelected(this);
        break;
      case VillagerState.jumping:
        this.counter = 0;
        this.stateMisc = 0;
        PathHorizontal.selectedVillagers.remove(this);
        break;
    }

    return true;
  }

  draw() {
    this.context.drawImageScaledFromSource(PathHorizontal.spriteImage, this.sourceX, this.sourceY, 32, 32, this.destX, this.destY, 32, 32);
  }
}

class Characters {
  List<Character> chars;

  Characters() {
    chars = new List<Character>();
    chars.add(new Character()
        ..name = "Vincent"
        ..trade = "Fighter"
        ..weapon = "SwordShield"
        ..spriteX = 0
        ..spriteY = 0
        ..icon = 0);
    chars.add(new Character()
        ..name = "Bregor"
        ..trade = "Ranger"
        ..weapon = "Bow"
        ..spriteX = 2
        ..spriteY = 0
        ..icon = 1);
    chars.add(new Character()
        ..name = "Tudagub"
        ..trade = "Cleric"
        ..weapon = "Hammer"
        ..spriteX = 4
        ..spriteY = 0
        ..icon = 2);
    chars.add(new Character()
        ..name = "Abigael"
        ..trade = "Rouge"
        ..weapon = "Dagger"
        ..spriteX = 6
        ..spriteY = 0
        ..icon = 3);
    chars.add(new Character()
        ..name = "Banon"
        ..trade = "Wizard"
        ..weapon = "Staff"
        ..spriteX = 8
        ..spriteY = 0
        ..icon = 4);
    chars.add(new Character()
        ..name = "Azril"
        ..trade = "Cleric"
        ..weapon = "Hammer"
        ..spriteX = 10
        ..spriteY = 0
        ..icon = 5);
    chars.add(new Character()
        ..name = "Horus"
        ..trade = "Fighter"
        ..weapon = "Spear"
        ..spriteX = 0
        ..spriteY = 4
        ..icon = 6);
  }

  Character operator [](int pos) {
    return this.chars[pos];
  }

  getRand() {
    return this.chars[Villager.rand.nextInt(this.chars.length)];
  }
}
class Character {
  String name = "";
  String trade = "";
  String weapon = "";
  int spriteX = 0;
  int spriteY = 0;
  int icon = 0;
}

class WinConditions {
  List<WinCondition> conditions;

  WinConditions() {
    int iconW = 32;

    conditions = new List<WinCondition>();
    for (Character c in Villager.characters.chars) {
      conditions.add(new WinCondition()//Find Singles
          ..text = "Find "
          ..hasIcon = true
          ..iconX = iconW * c.icon
          ..checkCondition = () {
            return PathHorizontal.selectedVillagers[0].character.name == c.name;
          });

      for (int i = 1; i < 4; i++) {
        conditions.add(new WinCondition()//Find 2 3 4 of the same
            ..text = "Find " + (i + 1).toString() + " of the same"
            ..characterCount = i + 1
            ..difficulty = i * 2 - 1
            ..checkCondition = () {
              return PathHorizontal.selectedVillagers.every((v) => v.character.name == PathHorizontal.selectedVillagers[0].character.name);
            });
      }

      for (int i = 1; i < 4; i++) {
        conditions.add(new WinCondition()//Find 2 3 4 of a specific
            ..text = "Find " + (i + 1).toString() + " "
            ..hasIcon = true
            ..characterCount = i + 1
            ..iconX = iconW * c.icon
            ..difficulty = i * 2
            ..checkCondition = () {
              return PathHorizontal.selectedVillagers.every((v) => v.character.name == c.name);
            });
      }
    }
  }

  getRand(int _maxDifficulty) {
    List<WinCondition> filtered = this.conditions.where((c) => c.difficulty <= _maxDifficulty).toList();
    return filtered[Villager.rand.nextInt(filtered.length)];
  }
}
class WinCondition extends ChangeNotifier {
  @reflectable @observable String get text => __$text; String __$text = ""; @reflectable set text(String value) { __$text = notifyPropertyChange(#text, __$text, value); }

  bool hasIcon = false;
  int iconX = 0;
  int iconY = 256;
  int characterCount = 1;
  int difficulty = 0;
  Function checkCondition;
}

class Direction {
  static const int down = 0;
  static const int left = 1;
  static const int right = 2;
  static const int up = 3;

  static int getNextClockwise(int dir) {
    switch (dir) {
      case up:
        return right;
      case right:
        return down;
      case down:
        return left;
      case left:
        return up;
    }
    return 0;
  }
}

class VillagerState {
  static const int walking = 0;
  static const int clicked = 1;
  static const int jumping = 2;
}
