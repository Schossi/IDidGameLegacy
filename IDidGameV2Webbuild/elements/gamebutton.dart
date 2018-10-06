import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('game-button')
class GameButton extends PolymerElement with ChangeNotifier  {
  @reflectable @published String get name => __$name; String __$name = ""; @reflectable set name(String value) { __$name = notifyPropertyChange(#name, __$name, value); }
  @reflectable @published String get path => __$path; String __$path = ""; @reflectable set path(String value) { __$path = notifyPropertyChange(#path, __$path, value); }
  @reflectable @published String get icon => __$icon; String __$icon = ""; @reflectable set icon(String value) { __$icon = notifyPropertyChange(#icon, __$icon, value); }
  @reflectable @published String get description => __$description; String __$description = ""; @reflectable set description(String value) { __$description = notifyPropertyChange(#description, __$description, value); }

  GameButton.created() : super.created() {
    path=path==""?name:path;
    icon=icon==""?path:icon;
    icon="/images/${icon}Icon.png";
  }

  void clicked() {
    window.location.href="/games/$path/Game.html";
  }
}

