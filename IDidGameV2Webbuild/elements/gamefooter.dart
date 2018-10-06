import 'package:polymer/polymer.dart';

/**
 * A Polymer click counter element.
 */
@CustomTag('game-footer')
class GameFooter extends PolymerElement with ChangeNotifier  {
  @reflectable @published String get tag => __$tag; String __$tag = ""; @reflectable set tag(String value) { __$tag = notifyPropertyChange(#tag, __$tag, value); }
  
  GameFooter.created() : super.created() {
  }
}

