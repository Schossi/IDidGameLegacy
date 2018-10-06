import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('game-button')
class GameButton extends PolymerElement {
  @published String name = "";
  @published String path = "";
  @published String icon = "";
  @published String description = "";

  GameButton.created() : super.created() {
    path=path==""?name:path;
    icon=icon==""?path:icon;
    icon="/images/${icon}Icon.png";
  }

  void clicked() {
    window.location.href="/games/$path/Game.html";
  }
}

